// apna-adda-backend/games/bluffMastersEngine.js

const { BLUFF_MASTERS_QUESTIONS, getQuestionsByCategory } = require('./bluffMastersQuestions');
const {
  secureChoice,
  secureSample,
  secureFisherYatesShuffle,
  secureRandomInt
} = require('../utils/secureRandom');

class BluffMastersEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.timer = null;

    // Track recently picked question IDs to avoid repeats
    this.usedQuestionIds = new Set();
    this.lastBlufferUserIds = [];

    // Configuration defaults
    this.totalRounds = (room.settings && room.settings.rounds) || 3;
    this.category = (room.settings && room.settings.category) || "All Categories";
    this.doubleTrouble = Boolean(room.settings && room.settings.doubleTrouble && room.players.length >= 6);

    this.timerSettings = {
      answering: (room.settings && room.settings.answerTime) || 30,
      discussion: (room.settings && room.settings.discussionTime) || 45,
      voting: (room.settings && room.settings.votingTime) || 15
    };

    // Public state (safe to broadcast to all players)
    this.state = {
      roomId: this.room._id,
      gameKey: 'BluffMasters',
      gamePhase: 'lobby', // 'answering' | 'discussion' | 'voting' | 'reveal' | 'game_over'
      roundNumber: 0,
      totalRounds: this.totalRounds,
      category: this.category,
      doubleTrouble: this.doubleTrouble,
      timer: 30,
      players: this.room.players.map((p, idx) => ({
        id: p.userId || p._id || p.name || String(idx),
        userId: p.userId,
        name: p.name,
        score: 0,
        roundScore: 0,
        connected: p.connected !== false,
        hasAnswered: false,
        hasVoted: false
      })),
      anonymousAnswers: [],
      discussionMessages: [],
      revealData: null,
      gameWinner: null,
      statusMessage: ''
    };

    // Private server-authoritative round data (STRICTLY HIDDEN from public state)
    this.privateRoundData = {
      questionPair: null,
      blufferUserIds: [],
      playerAnswers: new Map(), // userId -> { text, isBluffer, timestamp }
      votes: new Map() // voterUserId -> targetUserId
    };
  }

  start() {
    this.state.roundNumber = 0;
    this.startRound();
  }

  // -------------------------------------------------------------
  // ROUND SETUP & SECRET ROLE/QUESTION ASSIGNMENT
  // -------------------------------------------------------------
  startRound() {
    if (this.timer) clearInterval(this.timer);

    this.state.roundNumber += 1;
    this.state.gamePhase = 'answering';
    this.state.timer = this.timerSettings.answering;
    this.state.anonymousAnswers = [];
    this.state.discussionMessages = [];
    this.state.revealData = null;
    this.state.statusMessage = 'Secret questions distributed! Submit your answer.';

    // Reset per-round player flags
    this.state.players.forEach(p => {
      p.hasAnswered = false;
      p.hasVoted = false;
      p.roundScore = 0;
    });

    // 1. Select Question Pair
    const availablePool = getQuestionsByCategory(this.category);
    let unusedPool = availablePool.filter(q => !this.usedQuestionIds.has(q.id));
    if (unusedPool.length === 0) {
      // Pool exhausted; reset used IDs for this category
      this.usedQuestionIds.clear();
      unusedPool = availablePool;
    }
    const questionPair = secureChoice(unusedPool) || availablePool[0];
    this.usedQuestionIds.add(questionPair.id);

    // 2. Select Bluffer(s) with Cryptographically Secure Randomization
    const connectedPlayers = this.state.players.filter(p => p.connected !== false);
    // Double Trouble mode: 2 distinct Bluffers if enabled and at least 4 eligible players
    const blufferCount = (this.doubleTrouble && connectedPlayers.length >= 4) ? 2 : 1;

    // Cryptographically secure Fisher-Yates sample ensures:
    // - Every player has an identical, unbiased probability
    // - Independent random assignment every round (no hardcoded index or rotation)
    // - Two distinct Bluffers in Double Trouble (no player assigned twice)
    const selectedBluffers = secureSample(connectedPlayers, blufferCount).map(p => p.userId);

    this.lastBlufferUserIds = selectedBluffers;

    // Save private state
    this.privateRoundData = {
      questionPair,
      blufferUserIds: selectedBluffers,
      playerAnswers: new Map(),
      votes: new Map()
    };

    // 3. Emit Private Roles & Secret Questions to Each Player
    this.state.players.forEach(player => {
      const isBluffer = selectedBluffers.includes(player.userId);
      const privateCard = {
        role: isBluffer ? 'bluffer' : 'regular',
        isBluffer,
        question: isBluffer ? questionPair.blufferQuestion : questionPair.regularQuestion,
        category: questionPair.category,
        difficulty: questionPair.difficulty,
        roundNumber: this.state.roundNumber,
        totalRounds: this.state.totalRounds,
        timer: this.timerSettings.answering
      };

      this.io.to(`player_${player.userId}`).emit('privateCard', privateCard);
      this.io.to(`player_${player.userId}`).emit('privateStateUpdate', {
        bluffCard: privateCard
      });
    });

    // Broadcast public masked state
    this.broadcastState();

    // Start Answering Countdown
    this.startTimer('answering', this.timerSettings.answering, () => {
      this.finishAnswering();
    });
  }

  // -------------------------------------------------------------
  // ANSWER SUBMISSION & ANONYMIZATION
  // -------------------------------------------------------------
  submitAnswer(userId, answerText) {
    if (this.state.gamePhase !== 'answering') {
      return { error: "Answering phase has ended." };
    }

    const player = this.state.players.find(p => p.userId === userId);
    if (!player) return { error: "Player not found in room." };
    if (player.hasAnswered) return { error: "You have already submitted your answer." };

    const trimmed = (answerText || '').trim();
    if (!trimmed) return { error: "Answer cannot be blank." };

    const isBluffer = this.privateRoundData.blufferUserIds.includes(userId);
    this.privateRoundData.playerAnswers.set(userId, {
      text: trimmed,
      isBluffer,
      timestamp: Date.now()
    });

    player.hasAnswered = true;
    this.broadcastState();

    // If all connected players have submitted, immediately transition to discussion
    const activeConnected = this.state.players.filter(p => p.connected !== false);
    const allAnswered = activeConnected.every(p => p.hasAnswered);
    if (allAnswered) {
      if (this.timer) clearInterval(this.timer);
      this.finishAnswering();
    }

    return { ok: true, success: true };
  }

  finishAnswering() {
    if (this.timer) clearInterval(this.timer);

    // If any active player didn't answer before time expired, fill default
    this.state.players.forEach(p => {
      if (p.connected !== false && !this.privateRoundData.playerAnswers.has(p.userId)) {
        const isBluffer = this.privateRoundData.blufferUserIds.includes(p.userId);
        this.privateRoundData.playerAnswers.set(p.userId, {
          text: "(No answer submitted in time)",
          isBluffer,
          timestamp: Date.now(),
          missed: true
        });
        p.hasAnswered = true;
      }
    });

    // Anonymize and randomize answer order
    const rawAnswers = [];
    this.privateRoundData.playerAnswers.forEach((data, uId) => {
      rawAnswers.push({
        authorUserId: uId,
        text: data.text
      });
    });

    // Unbiased cryptographically secure shuffle for anonymous answers
    const shuffled = secureFisherYatesShuffle(rawAnswers);
    this.state.anonymousAnswers = shuffled.map((item, idx) => ({
      id: `ans_${idx + 1}`,
      text: item.text
    }));

    // Start Discussion Phase
    this.state.gamePhase = 'discussion';
    this.state.statusMessage = 'Answers revealed anonymously! Discuss who seems suspicious.';
    this.broadcastState();

    this.startTimer('discussion', this.timerSettings.discussion, () => {
      this.startVoting();
    });
  }

  // -------------------------------------------------------------
  // REAL-TIME DISCUSSION CHAT
  // -------------------------------------------------------------
  sendDiscussionMessage(userId, message) {
    if (this.state.gamePhase !== 'discussion') {
      return { error: "Discussion chat is only open during the discussion phase." };
    }

    const player = this.state.players.find(p => p.userId === userId);
    if (!player) return { error: "Player not found." };

    const text = (message || '').trim();
    if (!text) return { error: "Message cannot be empty." };

    const msg = {
      id: `${Date.now()}_${secureRandomInt(1000, 9999)}`,
      userId: player.userId,
      name: player.name,
      text: text.slice(0, 300),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.state.discussionMessages.push(msg);

    // Real-time broadcast
    this.broadcastRoomEvent('discussionMessage', msg);
    return { ok: true, success: true };
  }

  // -------------------------------------------------------------
  // VOTING PHASE & BLUFFER ACCUSATION
  // -------------------------------------------------------------
  startVoting() {
    if (this.timer) clearInterval(this.timer);

    this.state.gamePhase = 'voting';
    this.state.timer = this.timerSettings.voting;
    this.state.statusMessage = 'Vote for the player you suspect is the Bluffer!';

    this.state.players.forEach(p => {
      p.hasVoted = false;
    });

    this.broadcastState();

    this.startTimer('voting', this.timerSettings.voting, () => {
      this.resolveRound();
    });
  }

  submitVote(userId, targetUserId) {
    if (this.state.gamePhase !== 'voting') {
      return { error: "Voting phase has ended." };
    }

    const voter = this.state.players.find(p => p.userId === userId);
    if (!voter) return { error: "Voter not found in room." };
    if (voter.hasVoted) return { error: "You have already cast your vote." };

    if (userId === targetUserId) {
      return { error: "You cannot vote for yourself!" };
    }

    const target = this.state.players.find(p => p.userId === targetUserId);
    if (!target) return { error: "Invalid target player." };

    this.privateRoundData.votes.set(userId, targetUserId);
    voter.hasVoted = true;

    this.broadcastState();

    // If all active players have voted, proceed immediately
    const activeConnected = this.state.players.filter(p => p.connected !== false);
    const allVoted = activeConnected.every(p => p.hasVoted);
    if (allVoted) {
      if (this.timer) clearInterval(this.timer);
      this.resolveRound();
    }

    return { ok: true, success: true };
  }

  // -------------------------------------------------------------
  // REVEAL & AUTHORITATIVE SCORING
  // -------------------------------------------------------------
  resolveRound() {
    if (this.timer) clearInterval(this.timer);

    const qPair = this.privateRoundData.questionPair;
    const blufferIds = this.privateRoundData.blufferUserIds;
    const votes = this.privateRoundData.votes;

    // Tally votes per player
    const voteCounts = {};
    const voterBreakdown = {}; // targetUserId -> [voterNames]

    this.state.players.forEach(p => {
      voteCounts[p.userId] = 0;
      voterBreakdown[p.userId] = [];
    });

    votes.forEach((targetId, voterId) => {
      const voter = this.state.players.find(p => p.userId === voterId);
      if (voter && voteCounts[targetId] !== undefined) {
        voteCounts[targetId] += 1;
        voterBreakdown[targetId].push(voter.name);
      }
    });

    // Find highest vote count
    let maxVotes = 0;
    Object.values(voteCounts).forEach(v => {
      if (v > maxVotes) maxVotes = v;
    });

    const topAccused = Object.keys(voteCounts).filter(uId => voteCounts[uId] === maxVotes && maxVotes > 0);
    const isTie = topAccused.length > 1;

    // Score calculations
    const scoreChanges = {};
    this.state.players.forEach(p => {
      scoreChanges[p.userId] = 0;
    });

    const primaryBlufferId = blufferIds[0];
    const blufferPlayer = this.state.players.find(p => p.userId === primaryBlufferId);
    const blufferName = blufferPlayer ? blufferPlayer.name : 'Unknown';

    let roundWinner = 'bluffer';
    let roundSummary = '';

    if (maxVotes === 0) {
      // Nobody voted
      roundWinner = 'tie';
      roundSummary = "No votes were cast! The round is a draw.";
    } else if (isTie) {
      // Tie between multiple candidates
      roundWinner = 'tie';
      // Bluffer survives due to tie
      if (blufferPlayer) {
        scoreChanges[primaryBlufferId] += 3;
      }
      roundSummary = `It's a tie between ${topAccused.map(id => this.state.players.find(p => p.userId === id)?.name).join(' & ')}! Bluffer ${blufferName} survives (+3 pts).`;
    } else {
      const accusedId = topAccused[0];
      const accusedIsBluffer = blufferIds.includes(accusedId);

      if (accusedIsBluffer) {
        // Bluffer was caught by majority!
        roundWinner = 'town';
        scoreChanges[primaryBlufferId] += 1; // +1 consolation point for Bluffer

        // Regular players who correctly identified Bluffer get +2 points
        votes.forEach((targetId, voterId) => {
          if (blufferIds.includes(targetId)) {
            scoreChanges[voterId] = (scoreChanges[voterId] || 0) + 2;
          }
        });

        roundSummary = `🎯 Busted! ${blufferName} was caught as the Bluffer! Town wins this round (+2 pts to correct voters, +1 pt to Bluffer).`;
      } else {
        // Innocent player accused! Bluffer survives!
        roundWinner = 'bluffer';
        const blufferVotes = voteCounts[primaryBlufferId] || 0;

        if (blufferVotes === 0) {
          // Fooled EVERY eligible voter (+5 bonus)
          scoreChanges[primaryBlufferId] += 5;
          roundSummary = `🎭 Masterclass Bluff! ${blufferName} fooled EVERYONE with 0 votes! (+5 pts).`;
        } else {
          // Survived the vote (+3 points)
          scoreChanges[primaryBlufferId] += 3;
          roundSummary = `🎉 Escaped! ${blufferName} survived the vote! (+3 pts).`;
        }

        // Still award +2 points to any regular player who voted for the actual Bluffer
        votes.forEach((targetId, voterId) => {
          if (blufferIds.includes(targetId)) {
            scoreChanges[voterId] = (scoreChanges[voterId] || 0) + 2;
          }
        });
      }
    }

    // Apply scores
    this.state.players.forEach(p => {
      const change = scoreChanges[p.userId] || 0;
      p.roundScore = change;
      p.score += change;
    });

    // Prepare full revealed answers with authors
    const revealedAnswers = this.state.players.map(p => {
      const ansData = this.privateRoundData.playerAnswers.get(p.userId);
      return {
        playerId: p.id,
        userId: p.userId,
        playerName: p.name,
        text: ansData ? ansData.text : "(No answer)",
        isBluffer: blufferIds.includes(p.userId),
        votesReceived: voteCounts[p.userId] || 0,
        votedBy: voterBreakdown[p.userId] || []
      };
    });

    this.state.revealData = {
      blufferUserIds: blufferIds,
      blufferNames: blufferIds.map(id => this.state.players.find(p => p.userId === id)?.name || id),
      regularQuestion: qPair.regularQuestion,
      blufferQuestion: qPair.blufferQuestion,
      category: qPair.category,
      revealedAnswers,
      voteCounts,
      voterBreakdown,
      roundWinner,
      roundSummary,
      scoreChanges
    };

    this.state.gamePhase = 'reveal';
    this.state.statusMessage = roundSummary;

    // Check if game is complete
    if (this.state.roundNumber >= this.state.totalRounds) {
      // Find overall game winner(s)
      const maxScore = Math.max(...this.state.players.map(p => p.score));
      const winners = this.state.players.filter(p => p.score === maxScore).map(p => p.name);
      this.state.gameWinner = winners.join(' & ');
    }

    this.broadcastState();
  }

  // -------------------------------------------------------------
  // ADVANCEMENT & RESTART
  // -------------------------------------------------------------
  nextRound(userId) {
    const isHost = this.room.hostId === userId || this.state.players[0]?.userId === userId;
    if (!isHost) {
      return { error: "Only the room host can advance to the next round." };
    }

    if (this.state.roundNumber >= this.state.totalRounds) {
      this.state.gamePhase = 'game_over';
      this.broadcastState();
      return { ok: true, gameOver: true };
    }

    this.startRound();
    return { ok: true, startedNextRound: true };
  }

  restartGame(userId) {
    const isHost = this.room.hostId === userId || this.state.players[0]?.userId === userId;
    if (!isHost) {
      return { error: "Only the room host can restart the game." };
    }

    this.state.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
      p.hasAnswered = false;
      p.hasVoted = false;
    });

    this.state.roundNumber = 0;
    this.state.gameWinner = null;
    this.usedQuestionIds.clear();
    this.lastBlufferUserIds = [];

    this.startRound();
    return { ok: true };
  }

  // -------------------------------------------------------------
  // TIMERS & BROADCAST HELPERS
  // -------------------------------------------------------------
  startTimer(phase, seconds, onComplete) {
    if (this.timer) clearInterval(this.timer);
    this.state.timer = seconds;

    this.timer = setInterval(() => {
      this.state.timer -= 1;
      const tickPayload = { phase, timer: this.state.timer };

      this.io.to(`game_${this.room._id}`).emit('timerTick', tickPayload);
      this.io.to(`room_${this.room._id}`).emit('timerTick', tickPayload);
      this.io.to(this.room._id).emit('timerTick', tickPayload);

      if (this.state.timer <= 0) {
        clearInterval(this.timer);
        onComplete && onComplete();
      }
    }, 1000);
  }

  broadcastState() {
    const payload = {
      roomId: this.room._id,
      gameKey: 'BluffMasters',
      state: this.state
    };

    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(this.room._id).emit('gameStateUpdate', payload);
  }

  broadcastRoomEvent(eventName, payload) {
    this.io.to(`game_${this.room._id}`).emit(eventName, payload);
    this.io.to(`room_${this.room._id}`).emit(eventName, payload);
    this.io.to(this.room._id).emit(eventName, payload);
  }

  // -------------------------------------------------------------
  // PRIVATE CARD GETTER (FOR RECONNECTS & LATE MOUNTS)
  // -------------------------------------------------------------
  getPrivateCard(userId) {
    if (this.privateRoundData && this.privateRoundData.questionPair) {
      const isBluffer = this.privateRoundData.blufferUserIds.includes(userId);
      return {
        role: isBluffer ? 'bluffer' : 'regular',
        isBluffer,
        question: isBluffer ? this.privateRoundData.questionPair.blufferQuestion : this.privateRoundData.questionPair.regularQuestion,
        category: this.privateRoundData.questionPair.category,
        difficulty: this.privateRoundData.questionPair.difficulty,
        roundNumber: this.state.roundNumber,
        totalRounds: this.state.totalRounds,
        timer: this.state.timer
      };
    }
    return null;
  }

  // -------------------------------------------------------------
  // ACTION DISPATCHER
  // -------------------------------------------------------------
  handleAction(userId, action, payload, callback) {
    if (action === 'getPrivateCard') {
      const card = this.getPrivateCard(userId);
      if (card) {
        return callback && callback({ ok: true, card, privateCard: card });
      }
      return callback && callback({ error: "No active round data available." });
    }

    if (action === 'submitAnswer') {
      const res = this.submitAnswer(userId, payload.answer || payload.text);
      return callback && callback(res);
    }

    if (action === 'sendDiscussionMessage') {
      const res = this.sendDiscussionMessage(userId, payload.message || payload.text);
      return callback && callback(res);
    }

    if (action === 'startVoting') {
      const isHost = this.room.hostId === userId || this.state.players[0]?.userId === userId;
      if (!isHost) {
        return callback && callback({ error: "Only the host can start voting early." });
      }
      this.startVoting();
      return callback && callback({ ok: true });
    }

    if (action === 'submitVote') {
      const res = this.submitVote(userId, payload.targetUserId || payload.suspectUserId);
      return callback && callback(res);
    }

    if (action === 'nextRound') {
      const res = this.nextRound(userId);
      return callback && callback(res);
    }

    if (action === 'restartGame') {
      const res = this.restartGame(userId);
      return callback && callback(res);
    }

    callback && callback({ error: "Unknown action: " + action });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = BluffMastersEngine;
