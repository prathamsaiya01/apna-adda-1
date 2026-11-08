// apna-adda-backend/games/whatsTheMajorityEngine.js

const {
  CLASSIC_CROWD_QUESTIONS,
  FRIENDS_MODE_QUESTIONS,
  CATEGORIES
} = require("./whatsTheMajorityQuestions");

const {
  secureChoice,
  secureSample,
  secureFisherYatesShuffle,
  secureRandomInt,
  secureRandomIndex
} = require("../utils/secureRandom");

class WhatsTheMajorityEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.timer = null;
    this.transitionTimeout = null;

    // Track used questions in this match to avoid repetition
    this.usedCrowdQuestionIds = new Set();
    this.usedFriendsQuestionIds = new Set();

    // Match configuration
    const s = room.settings || {};
    this.totalRounds = Number(s.rounds) || 5;
    this.mode = s.mode || "classic_crowd"; // 'classic_crowd' | 'friends' | 'team_battle' | 'predict_winner' | 'chaos_round'
    this.baseTimerDuration = Number(s.roundTime) || 30; // 15, 30, 45, 60 seconds
    this.multiplier = Number(s.multiplier) || 1; // 1, 2, 3
    this.allowSelfVote = Boolean(s.allowSelfVote); // default false
    this.chaosEnabled = this.mode === "chaos_round" || Boolean(s.chaosEnabled);
    this.category = s.category || "All Categories";

    // Setup teams if team_battle mode
    this.teamAssignments = new Map(); // userId -> 'chai' | 'samosa'
    if (this.mode === "team_battle") {
      this.assignTeams();
    }

    // Public state (safe to broadcast to all clients)
    this.state = {
      roomId: this.room._id,
      gameKey: "WhatsTheMajority",
      gamePhase: "lobby", // 'round_intro' | 'voting' | 'reveal' | 'round_results' | 'game_over'
      roundNumber: 0,
      totalRounds: this.totalRounds,
      mode: this.mode,
      category: this.category,
      timer: this.baseTimerDuration,
      activeChaosRule: null, // null | 'double_points' | 'reverse_majority' | 'quick_vote' | 'hidden_leaderboard'
      currentQuestion: null, // Public stripped question (options have id & text, ranks HIDDEN)
      players: this.room.players.map((p, idx) => ({
        id: p.userId || p._id || p.name || String(idx),
        userId: p.userId,
        name: p.name,
        score: 0,
        roundScore: 0,
        team: this.teamAssignments.get(p.userId) || null,
        hasVoted: false,
        hasPredicted: false,
        connected: p.connected !== false
      })),
      teams: this.mode === "team_battle" ? {
        chai: { name: "Team Chai ☕", score: 0 },
        samosa: { name: "Team Samosa 🥟", score: 0 }
      } : null,
      revealData: null,
      gameWinner: null,
      statusMessage: "Game starting..."
    };

    // Private authoritative round data (NEVER broadcast directly before reveal)
    this.privateRoundData = {
      rawQuestion: null,
      submissions: new Map() // userId -> { optionId, targetUserId, predictedWinnerId, timestamp }
    };
  }

  assignTeams() {
    const shuffled = secureFisherYatesShuffle([...this.room.players]);
    shuffled.forEach((p, idx) => {
      const teamKey = idx % 2 === 0 ? "chai" : "samosa";
      this.teamAssignments.set(p.userId, teamKey);
    });
  }

  start() {
    this.state.roundNumber = 0;
    this.state.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
    });
    if (this.state.teams) {
      this.state.teams.chai.score = 0;
      this.state.teams.samosa.score = 0;
    }
    this.startRound();
  }

  startRound() {
    this.clearAllTimers();
    this.state.roundNumber += 1;

    // Reset player round flags
    this.state.players.forEach(p => {
      p.hasVoted = false;
      p.hasPredicted = false;
      p.roundScore = 0;
    });

    this.privateRoundData.submissions.clear();
    this.state.revealData = null;

    // Chaos rule determination
    this.state.activeChaosRule = null;
    let roundDuration = this.baseTimerDuration;

    if (this.chaosEnabled) {
      // Trigger chaos on final round or every 3rd round
      const isFinalRound = this.state.roundNumber === this.totalRounds;
      const isEvery3 = this.state.roundNumber % 3 === 0;
      if (this.mode === "chaos_round" || isFinalRound || isEvery3) {
        const chaosOptions = ["double_points", "reverse_majority", "quick_vote", "hidden_leaderboard"];
        this.state.activeChaosRule = secureChoice(chaosOptions);
        if (this.state.activeChaosRule === "quick_vote") {
          roundDuration = Math.min(12, Math.floor(this.baseTimerDuration / 2));
        }
      }
    }

    // Select question based on mode
    const isFriendsRound = this.mode === "friends";
    if (isFriendsRound) {
      const q = this.pickFriendsQuestion();
      this.privateRoundData.rawQuestion = q;
      this.state.currentQuestion = {
        id: q.id,
        category: q.category,
        prompt: q.prompt,
        followUp: q.followUp || "",
        mode: "friends",
        options: this.room.players.map(p => ({
          id: p.userId,
          text: p.name,
          isSelf: false // Updated per-client in getPublicState
        }))
      };
    } else {
      const q = this.pickCrowdQuestion();
      this.privateRoundData.rawQuestion = q;
      // Strip ranks and points for anti-cheat
      const shuffledOptions = secureFisherYatesShuffle(q.options).map(opt => ({
        id: opt.id,
        text: opt.text
      }));
      this.state.currentQuestion = {
        id: q.id,
        category: q.category,
        question: q.question,
        audience: q.audience,
        mode: "classic_crowd",
        options: shuffledOptions
      };
    }

    // Round intro phase
    this.state.gamePhase = "round_intro";
    this.state.statusMessage = `Round ${this.state.roundNumber} of ${this.totalRounds}`;
    this.broadcastState();

    // Transition to voting after 3 seconds
    this.transitionTimeout = setTimeout(() => {
      this.state.gamePhase = "voting";
      this.state.timer = roundDuration;
      this.state.statusMessage = this.isPredictWinnerActive()
        ? "Submit your choice & predict the crowd favourite!"
        : "Lock in your vote!";
      this.broadcastState();
      this.startCountdown(roundDuration);
    }, 2800);
  }

  isPredictWinnerActive() {
    return this.mode === "predict_winner" || this.mode === "team_battle";
  }

  pickCrowdQuestion() {
    let pool = CLASSIC_CROWD_QUESTIONS;
    if (this.category && this.category !== "All Categories") {
      const filtered = pool.filter(q => q.category.toLowerCase().includes(this.category.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    const unused = pool.filter(q => !this.usedCrowdQuestionIds.has(q.id));
    const selectedPool = unused.length > 0 ? unused : pool;
    const picked = secureChoice(selectedPool);
    this.usedCrowdQuestionIds.add(picked.id);
    return picked;
  }

  pickFriendsQuestion() {
    let pool = FRIENDS_MODE_QUESTIONS;
    const unused = pool.filter(q => !this.usedFriendsQuestionIds.has(q.id));
    const selectedPool = unused.length > 0 ? unused : pool;
    const picked = secureChoice(selectedPool);
    this.usedFriendsQuestionIds.add(picked.id);
    return picked;
  }

  startCountdown(seconds) {
    if (this.timer) clearInterval(this.timer);
    this.state.timer = seconds;

    this.timer = setInterval(() => {
      this.state.timer -= 1;
      this.broadcastState();

      if (this.state.timer <= 0) {
        this.clearAllTimers();
        this.lockAndReveal();
      }
    }, 1000);
  }

  clearAllTimers() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
  }

  handleAction(userId, action, payload, callback) {
    try {
      switch (action) {
        case "submitAnswer":
        case "submitVote":
          return this.handleSubmit(userId, payload, callback);

        case "getPrivateData":
          return this.handleGetPrivateData(userId, callback);

        case "nextRound":
          return this.handleNextRound(userId, callback);

        case "restartGame":
          return this.handleRestart(userId, callback);

        default:
          if (callback) callback({ ok: false, error: `Unknown action: ${action}` });
      }
    } catch (err) {
      console.error("[WhatsTheMajority] handleAction error:", err);
      if (callback) callback({ ok: false, error: err.message });
    }
  }

  handleSubmit(userId, payload, callback) {
    if (this.state.gamePhase !== "voting") {
      if (callback) callback({ ok: false, error: "Voting is closed for this round." });
      return;
    }

    const { optionId, targetUserId, predictedWinnerId } = payload || {};
    const chosenId = optionId || targetUserId;

    if (!chosenId) {
      if (callback) callback({ ok: false, error: "Missing selection choice." });
      return;
    }

    // If Friends mode and self voting disabled
    if (this.mode === "friends" && !this.allowSelfVote && chosenId === userId) {
      if (callback) callback({ ok: false, error: "Self-voting is disabled in this room." });
      return;
    }

    // Save submission
    this.privateRoundData.submissions.set(userId, {
      optionId: chosenId,
      predictedWinnerId: predictedWinnerId || null,
      timestamp: Date.now()
    });

    // Update public player status
    const player = this.state.players.find(p => p.userId === userId);
    if (player) {
      player.hasVoted = true;
      if (predictedWinnerId) player.hasPredicted = true;
    }

    if (callback) callback({ ok: true });
    this.broadcastState();

    // Check if all connected players have submitted
    const connectedPlayers = this.state.players.filter(p => p.connected);
    const allSubmitted = connectedPlayers.every(p => this.privateRoundData.submissions.has(p.userId));

    if (allSubmitted && connectedPlayers.length > 0) {
      this.clearAllTimers();
      // Brief buffer before reveal
      this.transitionTimeout = setTimeout(() => {
        this.lockAndReveal();
      }, 700);
    }
  }

  handleGetPrivateData(userId, callback) {
    const sub = this.privateRoundData.submissions.get(userId);
    if (callback) {
      callback({
        ok: true,
        hasSubmitted: Boolean(sub),
        selectedOptionId: sub ? sub.optionId : null,
        predictedWinnerId: sub ? sub.predictedWinnerId : null,
        myTeam: this.teamAssignments.get(userId) || null
      });
    }
  }

  handleNextRound(userId, callback) {
    if (this.room.hostId !== userId) {
      if (callback) callback({ ok: false, error: "Only the host can advance to the next round." });
      return;
    }
    if (this.state.gamePhase !== "round_results" && this.state.gamePhase !== "reveal") {
      if (callback) callback({ ok: false, error: "Cannot advance until round reveal is complete." });
      return;
    }

    if (this.state.roundNumber >= this.totalRounds) {
      this.concludeGame();
    } else {
      this.startRound();
    }
    if (callback) callback({ ok: true });
  }

  handleRestart(userId, callback) {
    if (this.room.hostId !== userId) {
      if (callback) callback({ ok: false, error: "Only the host can restart the game." });
      return;
    }
    this.start();
    if (callback) callback({ ok: true });
  }

  lockAndReveal() {
    this.clearAllTimers();
    this.state.gamePhase = "reveal";
    this.state.statusMessage = "All answers locked in! Revealing majority...";

    const rawQ = this.privateRoundData.rawQuestion;
    const isFriends = this.mode === "friends" || (rawQ && !rawQ.options);
    const chaos = this.state.activeChaosRule;
    const isReverse = chaos === "reverse_majority";
    const isDoublePoints = chaos === "double_points";
    const roundMultiplier = (this.multiplier || 1) * (isDoublePoints ? 2 : 1);

    const submissions = this.privateRoundData.submissions;
    const playerBreakdowns = [];

    if (isFriends) {
      // ------------------------------------
      // FRIENDS MODE SCORING
      // ------------------------------------
      const voteCounts = new Map(); // targetUserId -> count
      this.room.players.forEach(p => voteCounts.set(p.userId, 0));

      submissions.forEach(sub => {
        if (voteCounts.has(sub.optionId)) {
          voteCounts.set(sub.optionId, voteCounts.get(sub.optionId) + 1);
        }
      });

      // Find highest vote count
      let maxVotes = 0;
      voteCounts.forEach(count => {
        if (count > maxVotes) maxVotes = count;
      });

      const majorityUserIds = [];
      if (maxVotes > 0) {
        voteCounts.forEach((count, uid) => {
          if (count === maxVotes) majorityUserIds.push(uid);
        });
      }

      this.state.players.forEach(p => {
        const sub = submissions.get(p.userId);
        let points = 0;
        let predictionBonus = 0;
        const votedForId = sub ? sub.optionId : null;
        const targetPlayer = this.state.players.find(tp => tp.userId === votedForId);
        const votedForName = targetPlayer ? targetPlayer.name : "No Vote";
        const isMajority = Boolean(votedForId && majorityUserIds.includes(votedForId));

        if (isMajority) {
          points = 40 * roundMultiplier;
        }

        // Prediction bonus (+50 points)
        if (sub && sub.predictedWinnerId && majorityUserIds.includes(sub.predictedWinnerId)) {
          predictionBonus = 50 * roundMultiplier;
        }

        const totalRoundPoints = points + predictionBonus;
        p.roundScore = totalRoundPoints;
        p.score += totalRoundPoints;

        playerBreakdowns.push({
          userId: p.userId,
          name: p.name,
          votedForId,
          votedForName,
          isMajority,
          pointsAwarded: points,
          predictionBonus,
          totalRoundPoints
        });
      });

      const majorityPlayerNames = majorityUserIds
        .map(uid => {
          const pl = this.state.players.find(p => p.userId === uid);
          return pl ? pl.name : uid;
        })
        .join(", ");

      this.state.revealData = {
        mode: "friends",
        majorityUserIds,
        majorityPlayerNames: majorityPlayerNames || "No consensus",
        maxVotes,
        voteDistribution: Array.from(voteCounts.entries()).map(([uid, count]) => {
          const pl = this.state.players.find(p => p.userId === uid);
          return { userId: uid, name: pl ? pl.name : uid, votes: count };
        }).sort((a, b) => b.votes - a.votes),
        playerBreakdowns,
        chaos
      };
    } else {
      // ------------------------------------
      // CLASSIC CROWD SCORING
      // ------------------------------------
      const rawQ = this.privateRoundData.rawQuestion;
      const optionMap = new Map();
      rawQ.options.forEach(opt => {
        // Adjust points for reverse majority chaos rule
        let effectiveRank = opt.rank;
        let effectivePoints = opt.points;
        if (isReverse) {
          effectiveRank = 5 - opt.rank;
          effectivePoints = effectiveRank === 1 ? 40 : effectiveRank === 2 ? 30 : effectiveRank === 3 ? 20 : 10;
        }
        optionMap.set(opt.id, {
          ...opt,
          effectiveRank,
          effectivePoints: effectivePoints * roundMultiplier,
          voterUserIds: []
        });
      });

      // Track room player vote distribution across options
      const roomOptionVotes = new Map();
      rawQ.options.forEach(opt => roomOptionVotes.set(opt.id, 0));

      submissions.forEach((sub, uid) => {
        if (optionMap.has(sub.optionId)) {
          optionMap.get(sub.optionId).voterUserIds.push(uid);
          roomOptionVotes.set(sub.optionId, (roomOptionVotes.get(sub.optionId) || 0) + 1);
        }
      });

      // Find the room's most picked option for prediction scoring
      let roomTopOptionId = null;
      let roomTopVotes = 0;
      roomOptionVotes.forEach((votes, optId) => {
        if (votes > roomTopVotes) {
          roomTopVotes = votes;
          roomTopOptionId = optId;
        }
      });

      this.state.players.forEach(p => {
        const sub = submissions.get(p.userId);
        let points = 0;
        let predictionBonus = 0;
        let chosenOptionText = "No Submission";
        let rank = null;

        if (sub && optionMap.has(sub.optionId)) {
          const opt = optionMap.get(sub.optionId);
          chosenOptionText = opt.text;
          rank = opt.effectiveRank;
          points = opt.effectivePoints;
        }

        // Prediction bonus (+50 points)
        if (sub && sub.predictedWinnerId) {
          const isWinnerMatch = isReverse
            ? sub.predictedWinnerId === rawQ.options.find(o => o.rank === 4)?.id
            : sub.predictedWinnerId === rawQ.options.find(o => o.rank === 1)?.id;
          if (isWinnerMatch) {
            predictionBonus = 50 * roundMultiplier;
          }
        }

        const totalRoundPoints = points + predictionBonus;
        p.roundScore = totalRoundPoints;
        p.score += totalRoundPoints;

        // If team battle, accumulate team scores
        if (this.mode === "team_battle" && p.team && this.state.teams[p.team]) {
          this.state.teams[p.team].score += totalRoundPoints;
        }

        playerBreakdowns.push({
          userId: p.userId,
          name: p.name,
          chosenOptionText,
          rank,
          pointsAwarded: points,
          predictionBonus,
          totalRoundPoints
        });
      });

      this.state.revealData = {
        mode: "classic_crowd",
        rankedOptions: Array.from(optionMap.values())
          .sort((a, b) => a.effectiveRank - b.effectiveRank)
          .map(opt => ({
            id: opt.id,
            text: opt.text,
            rank: opt.effectiveRank,
            points: opt.effectivePoints,
            percentage: opt.percentage,
            voterNames: opt.voterUserIds.map(uid => {
              const pl = this.state.players.find(p => p.userId === uid);
              return pl ? pl.name : uid;
            })
          })),
        playerBreakdowns,
        chaos
      };
    }

    this.broadcastState();

    // Transition from reveal to round_results after 6 seconds
    this.transitionTimeout = setTimeout(() => {
      this.state.gamePhase = "round_results";
      this.state.statusMessage = "Round scores finalized!";
      this.broadcastState();
    }, 6000);
  }

  concludeGame() {
    this.clearAllTimers();
    this.state.gamePhase = "game_over";

    if (this.mode === "team_battle") {
      const chai = this.state.teams.chai.score;
      const samosa = this.state.teams.samosa.score;
      if (chai > samosa) {
        this.state.gameWinner = { type: "team", name: "Team Chai ☕", score: chai };
      } else if (samosa > chai) {
        this.state.gameWinner = { type: "team", name: "Team Samosa 🥟", score: samosa };
      } else {
        this.state.gameWinner = { type: "team_tie", name: "Epic Chai-Samosa Tie! ☕🥟", score: chai };
      }
    } else {
      const sorted = [...this.state.players].sort((a, b) => b.score - a.score);
      const topScore = sorted[0]?.score || 0;
      const winners = sorted.filter(p => p.score === topScore);
      this.state.gameWinner = {
        type: winners.length > 1 ? "tie" : "individual",
        name: winners.map(w => w.name).join(" & "),
        score: topScore,
        winners: winners.map(w => ({ userId: w.userId, name: w.name, score: w.score }))
      };
    }

    this.state.statusMessage = "Game Over! Adda champions crowned!";
    this.broadcastState();
  }

  handlePlayerReconnect(userId, socketId) {
    const player = this.state.players.find(p => p.userId === userId);
    if (player) {
      player.connected = true;
    }
    this.broadcastState();
  }

  handlePlayerDisconnect(userId) {
    const player = this.state.players.find(p => p.userId === userId);
    if (player) {
      player.connected = false;
    }
    this.broadcastState();
  }

  getPublicState() {
    return {
      ...this.state,
      // Hide rankings if chaos rule hidden_leaderboard is active during results
      players: this.state.players.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        score: (this.state.activeChaosRule === "hidden_leaderboard" && this.state.gamePhase !== "game_over")
          ? "???"
          : p.score,
        roundScore: p.roundScore,
        team: p.team,
        hasVoted: p.hasVoted,
        hasPredicted: p.hasPredicted,
        connected: p.connected
      }))
    };
  }

  broadcastState() {
    const publicState = this.getPublicState();
    this.io.to(`game_${this.room._id}`).emit("gameStateUpdate", publicState);
  }

  destroy() {
    this.clearAllTimers();
    this.privateRoundData.submissions.clear();
  }
}

module.exports = WhatsTheMajorityEngine;
