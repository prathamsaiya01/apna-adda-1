// apna-adda-backend/games/mafiaEngine.js
const { secureFisherYatesShuffle } = require('../utils/secureRandom');

/**
 * Official Mafia Role Configurations:
 * 5 players:  1 Mafia, 1 Detective, 1 Doctor, 2 Villagers
 * 6 players:  2 Mafia, 1 Detective, 1 Doctor, 2 Villagers
 * 7 players:  2 Mafia, 1 Detective, 1 Doctor, 3 Villagers
 * 8 players:  2 Mafia, 1 Detective, 1 Doctor, 4 Villagers
 * 9 players:  2 Mafia, 1 Detective, 1 Doctor, 5 Villagers
 * 10 players: 3 Mafia, 1 Detective, 1 Doctor, 5 Villagers
 * 11 players: 3 Mafia, 1 Detective, 1 Doctor, 6 Villagers
 * 12 players: 3 Mafia, 1 Detective, 1 Doctor, 7 Villagers
 * 13 players: 4 Mafia, 1 Detective, 1 Doctor, 7 Villagers
 * 14 players: 4 Mafia, 1 Detective, 1 Doctor, 8 Villagers
 * 15 players: 4 Mafia, 1 Detective, 1 Doctor, 9 Villagers
 * 16 players: 4 Mafia, 1 Detective, 1 Doctor, 10 Villagers
 */
function getRoleDistribution(count) {
  if (count <= 5) return { mafia: 1, detective: 1, doctor: 1, villager: Math.max(0, count - 3) };
  if (count <= 9) return { mafia: 2, detective: 1, doctor: 1, villager: count - 4 };
  if (count <= 12) return { mafia: 3, detective: 1, doctor: 1, villager: count - 5 };
  return { mafia: 4, detective: 1, doctor: 1, villager: count - 6 };
}



class MafiaEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;

    this.timer = null;
    this.phaseTimeRemaining = 0;

    // Secret role store (Authoritative - NEVER sent to public socket channel)
    // Map: userId -> { role: 'mafia'|'detective'|'doctor'|'villager', isAlive: boolean }
    this.secretRoles = new Map();

    // Night actions submitted this cycle:
    // mafiaVotes: Map: userId -> targetUserId
    this.nightActions = {
      mafiaVotes: new Map(),
      doctorTarget: null,
      detectiveTarget: null,
      detectiveResult: null
    };

    // Day voting submitted this cycle:
    // votes: Map: userId (voter) -> targetUserId (candidate)
    this.dayVotes = new Map();
    this.revoteCandidates = []; // Populated if tie occurs

    // Chat storage: public day chat & private night mafia chat
    this.publicChat = [];
    this.mafiaChat = [];

    // Public game state (Visible to all clients)
    this.state = {
      gameKey: 'Mafia',
      phase: 'role_reveal', // 'role_reveal' | 'night' | 'night_resolution' | 'day_announcement' | 'discussion' | 'voting' | 'revote' | 'elimination' | 'game_over'
      dayNumber: 1,
      players: room.players.map(p => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        isAlive: true,
        votesReceived: 0,
        hasVoted: false,
        hasActedNight: false
      })),
      eliminatedLastNight: null, // { userId, name } or null if doctor saved
      eliminatedLastVote: null,  // { userId, name, role } or null if tied
      gameWinner: null, // 'town' | 'mafia' | null
      winReason: '',
      phaseDuration: 10,
      phaseTimeRemaining: 10,
      revoteCandidates: [],
      // Role configuration numbers for transparency
      roleConfig: getRoleDistribution(room.players.length),
      historyLog: []
    };
  }

  start() {
    this.assignSecretRoles();
    this.state.phase = 'role_reveal';
    this.state.phaseDuration = 10;
    this.state.phaseTimeRemaining = 10;
    this.state.historyLog.push({
      id: Date.now().toString(),
      type: 'system',
      message: 'Game started! Check your secret role card.'
    });

    this.broadcastState();
    this.sendAllPrivateCards();

    // Wait 10 seconds in role reveal before starting first Night
    this.startPhaseTimer(10, () => {
      this.startNightPhase();
    });
  }

  assignSecretRoles() {
    const players = this.room.players;
    const count = players.length;
    const config = getRoleDistribution(count);

    const rolesPool = [];
    for (let i = 0; i < config.mafia; i++) rolesPool.push('mafia');
    for (let i = 0; i < config.detective; i++) rolesPool.push('detective');
    for (let i = 0; i < config.doctor; i++) rolesPool.push('doctor');
    while (rolesPool.length < count) rolesPool.push('villager');

    // Unbiased cryptographic Fisher-Yates shuffle
    const shuffledRoles = secureFisherYatesShuffle(rolesPool);
    // Also securely shuffle players so position/join order has zero influence
    const shuffledPlayers = secureFisherYatesShuffle(players);

    this.secretRoles.clear();
    shuffledPlayers.forEach((p, idx) => {
      this.secretRoles.set(p.userId, {
        role: shuffledRoles[idx],
        isAlive: true
      });
    });
  }

  getPrivateCard(userId) {
    const entry = this.secretRoles.get(userId);
    if (!entry) return null;

    const base = {
      role: entry.role,
      isAlive: entry.isAlive
    };

    // If Mafia, also reveal list of living teammates
    if (entry.role === 'mafia') {
      const teammates = [];
      for (const [uid, secret] of this.secretRoles.entries()) {
        if (secret.role === 'mafia') {
          const pl = this.room.players.find(p => p.userId === uid);
          teammates.push({
            userId: uid,
            name: pl ? pl.name : 'Unknown',
            isAlive: secret.isAlive
          });
        }
      }
      base.teammates = teammates;
    }

    return base;
  }

  sendAllPrivateCards() {
    this.room.players.forEach(p => {
      const card = this.getPrivateCard(p.userId);
      if (card) {
        this.io.to(`player_${p.userId}`).emit('privateStateUpdate', {
          gameKey: 'Mafia',
          privateCard: card,
          ...card
        });
        this.io.to(`player_${p.userId}`).emit('privateCard', card);
      }
    });
  }

  startPhaseTimer(durationSeconds, onComplete) {
    if (this.timer) clearInterval(this.timer);
    this.phaseTimeRemaining = durationSeconds;
    this.state.phaseDuration = durationSeconds;
    this.state.phaseTimeRemaining = durationSeconds;

    this.timer = setInterval(() => {
      this.phaseTimeRemaining -= 1;
      this.state.phaseTimeRemaining = this.phaseTimeRemaining;

      if (this.phaseTimeRemaining <= 0) {
        clearInterval(this.timer);
        this.timer = null;
        onComplete && onComplete();
      } else {
        const payload = {
          gameKey: 'Mafia',
          phaseTimeRemaining: this.phaseTimeRemaining
        };
        this.io.to(`game_${this.room._id}`).emit('timerTick', payload);
        this.io.to(`room_${this.room._id}`).emit('timerTick', payload);
      }
    }, 1000);
  }

  // ---------------- NIGHT PHASE ----------------
  startNightPhase() {
    this.state.phase = 'night';
    this.nightActions = {
      mafiaVotes: new Map(),
      doctorTarget: null,
      detectiveTarget: null,
      detectiveResult: null
    };

    // Reset night action indicators
    this.state.players.forEach(p => {
      p.hasActedNight = false;
    });

    this.state.historyLog.push({
      id: Date.now().toString(),
      type: 'phase',
      message: `Night ${this.state.dayNumber} has fallen. Town sleeps, special roles awaken!`
    });

    this.broadcastState();
    this.sendAllPrivateCards();

    // 40 second night timer
    this.startPhaseTimer(40, () => {
      this.resolveNight();
    });
  }

  checkAllNightActionsComplete() {
    // Check if living Mafia voted, Doctor acted, Detective acted
    let livingMafiaCount = 0;
    let livingDoctorAlive = false;
    let livingDetectiveAlive = false;

    for (const [uid, secret] of this.secretRoles.entries()) {
      if (secret.isAlive) {
        if (secret.role === 'mafia') livingMafiaCount++;
        if (secret.role === 'doctor') livingDoctorAlive = true;
        if (secret.role === 'detective') livingDetectiveAlive = true;
      }
    }

    const mafiaVotesCount = this.nightActions.mafiaVotes.size;
    const doctorActed = !livingDoctorAlive || this.nightActions.doctorTarget !== null;
    const detectiveActed = !livingDetectiveAlive || this.nightActions.detectiveTarget !== null;

    if (mafiaVotesCount >= livingMafiaCount && doctorActed && detectiveActed) {
      // Early resolve night if all alive actors have submitted
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.resolveNight();
    }
  }

  resolveNight() {
    this.state.phase = 'night_resolution';

    // 1. Tally Mafia Target Votes
    const voteCounts = new Map();
    for (const targetId of this.nightActions.mafiaVotes.values()) {
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    }

    let finalMafiaTarget = null;
    let highestVotes = 0;
    let isTie = false;

    for (const [targetId, count] of voteCounts.entries()) {
      if (count > highestVotes) {
        highestVotes = count;
        finalMafiaTarget = targetId;
        isTie = false;
      } else if (count === highestVotes) {
        isTie = true;
      }
    }

    // Tie means no target selected
    if (isTie) {
      finalMafiaTarget = null;
    }

    // 2. Doctor Protection
    const protectedTarget = this.nightActions.doctorTarget;

    // 3. Resolve Elimination
    let victimId = null;
    if (finalMafiaTarget && finalMafiaTarget !== protectedTarget) {
      victimId = finalMafiaTarget;
      const secret = this.secretRoles.get(victimId);
      if (secret && secret.isAlive) {
        secret.isAlive = false;
        const pl = this.state.players.find(p => p.userId === victimId);
        if (pl) pl.isAlive = false;
      }
    }

    if (victimId) {
      const victimPl = this.room.players.find(p => p.userId === victimId);
      this.state.eliminatedLastNight = {
        userId: victimId,
        name: victimPl ? victimPl.name : 'Unknown Player'
      };
      this.state.historyLog.push({
        id: Date.now().toString(),
        type: 'death',
        message: `☀️ Morning arrived: ${victimPl ? victimPl.name : 'A player'} was found eliminated by the Mafia.`
      });
    } else {
      this.state.eliminatedLastNight = null;
      this.state.historyLog.push({
        id: Date.now().toString(),
        type: 'save',
        message: '☀️ Morning arrived: Peaceful night! Nobody was eliminated.'
      });
    }

    this.broadcastState();
    this.sendAllPrivateCards();

    // Check Win Condition immediately after night death
    const winner = this.checkWinConditions();
    if (winner) {
      this.endGame(winner.team, winner.reason);
      return;
    }

    // 4 second brief announcement before Discussion starts
    this.state.phase = 'day_announcement';
    this.startPhaseTimer(5, () => {
      this.startDiscussionPhase();
    });
  }

  // ---------------- DAY DISCUSSION PHASE ----------------
  startDiscussionPhase() {
    this.state.phase = 'discussion';
    this.dayVotes.clear();
    this.revoteCandidates = [];
    this.state.revoteCandidates = [];

    this.state.players.forEach(p => {
      p.votesReceived = 0;
      p.hasVoted = false;
    });

    this.state.historyLog.push({
      id: Date.now().toString(),
      type: 'phase',
      message: `Day ${this.state.dayNumber} Discussion: Discuss openly and identify the suspects!`
    });

    this.broadcastState();

    // 60-second Day discussion timer
    this.startPhaseTimer(60, () => {
      this.startVotingPhase(false);
    });
  }

  // ---------------- VOTING & REVOTE PHASES ----------------
  startVotingPhase(isRevote = false, candidates = []) {
    this.state.phase = isRevote ? 'revote' : 'voting';
    this.dayVotes.clear();
    this.revoteCandidates = candidates;
    this.state.revoteCandidates = candidates;

    this.state.players.forEach(p => {
      p.votesReceived = 0;
      p.hasVoted = false;
    });

    this.state.historyLog.push({
      id: Date.now().toString(),
      type: 'phase',
      message: isRevote
        ? 'Tie detected! Revote among the tied candidates now.'
        : 'Voting is now open! Cast your vote to eliminate a suspect.'
    });

    this.broadcastState();

    // 35-second Voting timer
    this.startPhaseTimer(35, () => {
      this.resolveVotes(isRevote);
    });
  }

  resolveVotes(wasRevote = false) {
    this.state.phase = 'elimination';

    const tally = new Map();
    // Count votes
    for (const candidateId of this.dayVotes.values()) {
      if (candidateId) {
        tally.set(candidateId, (tally.get(candidateId) || 0) + 1);
      }
    }

    // Update public votes count
    this.state.players.forEach(p => {
      p.votesReceived = tally.get(p.userId) || 0;
    });

    let maxVotes = 0;
    let leaders = [];

    for (const [candidateId, count] of tally.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        leaders = [candidateId];
      } else if (count === maxVotes) {
        leaders.push(candidateId);
      }
    }

    // Tie handling:
    if (leaders.length > 1 && maxVotes > 0) {
      if (!wasRevote) {
        // First tie -> Trigger Revote phase
        this.startVotingPhase(true, leaders);
        return;
      } else {
        // Tied again in revote -> No elimination occurs
        this.state.eliminatedLastVote = null;
        this.state.historyLog.push({
          id: Date.now().toString(),
          type: 'info',
          message: 'Revote resulted in another tie! No player was eliminated today.'
        });
      }
    } else if (leaders.length === 1 && maxVotes > 0) {
      const eliminatedId = leaders[0];
      const secret = this.secretRoles.get(eliminatedId);
      if (secret) secret.isAlive = false;

      const pl = this.state.players.find(p => p.userId === eliminatedId);
      if (pl) pl.isAlive = false;

      const userPl = this.room.players.find(p => p.userId === eliminatedId);
      this.state.eliminatedLastVote = {
        userId: eliminatedId,
        name: userPl ? userPl.name : 'Unknown',
        role: secret ? secret.role : 'villager'
      };

      this.state.historyLog.push({
        id: Date.now().toString(),
        type: 'death',
        message: `⚖️ The town voted to eliminate ${userPl ? userPl.name : 'A player'}. Their role was ${secret ? secret.role.toUpperCase() : 'UNKNOWN'}.`
      });
    } else {
      // Nobody voted
      this.state.eliminatedLastVote = null;
      this.state.historyLog.push({
        id: Date.now().toString(),
        type: 'info',
        message: 'No votes were cast! Nobody was eliminated today.'
      });
    }

    this.broadcastState();
    this.sendAllPrivateCards();

    // Check win condition after vote
    const winner = this.checkWinConditions();
    if (winner) {
      this.endGame(winner.team, winner.reason);
      return;
    }

    // 6 seconds to view elimination results, then proceed to next Night
    this.startPhaseTimer(6, () => {
      this.state.dayNumber += 1;
      this.startNightPhase();
    });
  }

  // ---------------- WIN CONDITIONS ----------------
  checkWinConditions() {
    let livingMafia = 0;
    let livingTown = 0;

    for (const secret of this.secretRoles.values()) {
      if (secret.isAlive) {
        if (secret.role === 'mafia') {
          livingMafia++;
        } else {
          livingTown++;
        }
      }
    }

    if (livingMafia === 0) {
      return {
        team: 'town',
        reason: 'All Mafia members have been eliminated! The Town wins!'
      };
    }

    if (livingMafia >= livingTown) {
      return {
        team: 'mafia',
        reason: 'Mafia numbers equal or exceed Town members! The Mafia wins!'
      };
    }

    return null;
  }

  endGame(winnerTeam, reason) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    this.state.phase = 'game_over';
    this.state.gameWinner = winnerTeam;
    this.state.winReason = reason;

    // Full role reveal for everyone on game over
    const revealedRoles = {};
    for (const [uid, secret] of this.secretRoles.entries()) {
      revealedRoles[uid] = secret.role;
    }
    this.state.allRevealedRoles = revealedRoles;

    this.state.historyLog.push({
      id: Date.now().toString(),
      type: 'winner',
      message: `🏆 GAME OVER: ${reason}`
    });

    this.broadcastState();
  }

  // ---------------- ACTIONS & EVENT HANDLING ----------------
  handleAction(userId, action, payload, callback) {
    const actorSecret = this.secretRoles.get(userId);
    if (!actorSecret) {
      return callback && callback({ error: 'Player role not found' });
    }

    // Eliminated players cannot perform game actions
    if (!actorSecret.isAlive && action !== 'sendDayChat') {
      return callback && callback({ error: 'Eliminated players cannot perform active actions' });
    }

    // --- NIGHT ACTIONS ---
    if (action === 'submitNightAction') {
      if (this.state.phase !== 'night') {
        return callback && callback({ error: 'Night phase is not active' });
      }

      const role = actorSecret.role;
      const targetUserId = payload.targetUserId;

      if (role === 'mafia') {
        if (!targetUserId) return callback && callback({ error: 'Target required' });
        if (targetUserId === userId) return callback && callback({ error: 'Cannot target yourself' });

        const targetSecret = this.secretRoles.get(targetUserId);
        if (!targetSecret || !targetSecret.isAlive) {
          return callback && callback({ error: 'Cannot target eliminated players' });
        }
        if (targetSecret.role === 'mafia') {
          return callback && callback({ error: 'Cannot target another Mafia teammate' });
        }

        this.nightActions.mafiaVotes.set(userId, targetUserId);

        const pl = this.state.players.find(p => p.userId === userId);
        if (pl) pl.hasActedNight = true;

        // Broadcast to other mafia members that a teammate voted
        for (const [uid, sec] of this.secretRoles.entries()) {
          if (sec.role === 'mafia') {
            this.io.to(`player_${uid}`).emit('mafiaTargetUpdate', {
              voterId: userId,
              targetUserId
            });
          }
        }

        this.checkAllNightActionsComplete();
        return callback && callback({ ok: true, success: true });
      }

      if (role === 'doctor') {
        if (!targetUserId) return callback && callback({ error: 'Protection target required' });
        const targetSecret = this.secretRoles.get(targetUserId);
        if (!targetSecret || !targetSecret.isAlive) {
          return callback && callback({ error: 'Cannot protect eliminated players' });
        }

        this.nightActions.doctorTarget = targetUserId;
        const pl = this.state.players.find(p => p.userId === userId);
        if (pl) pl.hasActedNight = true;

        this.checkAllNightActionsComplete();
        return callback && callback({ ok: true, success: true });
      }

      if (role === 'detective') {
        if (!targetUserId) return callback && callback({ error: 'Investigation target required' });
        if (targetUserId === userId) return callback && callback({ error: 'Cannot investigate yourself' });

        const targetSecret = this.secretRoles.get(targetUserId);
        if (!targetSecret || !targetSecret.isAlive) {
          return callback && callback({ error: 'Cannot investigate eliminated players' });
        }

        this.nightActions.detectiveTarget = targetUserId;
        const isTargetMafia = targetSecret.role === 'mafia';
        const resultString = isTargetMafia ? 'Mafia' : 'Not Mafia';

        const pl = this.state.players.find(p => p.userId === userId);
        if (pl) pl.hasActedNight = true;

        // Send private result ONLY to this detective's socket
        this.io.to(`player_${userId}`).emit('detectiveResult', {
          targetUserId,
          result: resultString
        });

        this.checkAllNightActionsComplete();
        return callback && callback({ ok: true, success: true, result: resultString });
      }

      return callback && callback({ error: 'Villagers have no nighttime action' });
    }

    // --- DAY DISCUSSION CHAT ---
    if (action === 'sendDayChat') {
      if (this.state.phase !== 'discussion' && this.state.phase !== 'voting' && this.state.phase !== 'revote') {
        return callback && callback({ error: 'Public chat is closed during Night' });
      }
      if (!actorSecret.isAlive) {
        return callback && callback({ error: 'Eliminated players cannot speak during Day' });
      }

      const rawMsg = (payload.message || '').trim();
      if (!rawMsg) return callback && callback({ error: 'Empty message' });
      if (rawMsg.length > 280) return callback && callback({ error: 'Message exceeds 280 characters' });

      const senderPl = this.room.players.find(p => p.userId === userId);
      const chatItem = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: senderPl ? senderPl.name : 'Unknown',
        message: rawMsg,
        timestamp: new Date().toISOString()
      };

      this.publicChat.push(chatItem);
      // Keep last 100 messages
      if (this.publicChat.length > 100) this.publicChat.shift();

      this.io.to(`game_${this.room._id}`).emit('dayChatMessage', chatItem);
      this.io.to(`room_${this.room._id}`).emit('dayChatMessage', chatItem);
      return callback && callback({ ok: true, success: true });
    }

    // --- NIGHT MAFIA CHAT ---
    if (action === 'sendMafiaChat') {
      if (this.state.phase !== 'night') {
        return callback && callback({ error: 'Mafia chat is only open during Night' });
      }
      if (actorSecret.role !== 'mafia') {
        return callback && callback({ error: 'Unauthorized: Mafia only' });
      }
      if (!actorSecret.isAlive) {
        return callback && callback({ error: 'Eliminated Mafia cannot speak' });
      }

      const rawMsg = (payload.message || '').trim();
      if (!rawMsg) return callback && callback({ error: 'Empty message' });

      const senderPl = this.room.players.find(p => p.userId === userId);
      const chatItem = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: senderPl ? senderPl.name : 'Unknown',
        message: rawMsg,
        timestamp: new Date().toISOString()
      };

      this.mafiaChat.push(chatItem);

      // Emit strictly to living Mafia member sockets
      for (const [uid, sec] of this.secretRoles.entries()) {
        if (sec.role === 'mafia' && sec.isAlive) {
          this.io.to(`player_${uid}`).emit('mafiaChatMessage', chatItem);
        }
      }
      return callback && callback({ ok: true, success: true });
    }

    // --- VOTING ACTIONS ---
    if (action === 'submitVote') {
      if (this.state.phase !== 'voting' && this.state.phase !== 'revote') {
        return callback && callback({ error: 'Voting is not active' });
      }
      if (!actorSecret.isAlive) {
        return callback && callback({ error: 'Eliminated players cannot vote' });
      }
      if (this.dayVotes.has(userId)) {
        return callback && callback({ error: 'You have already voted' });
      }

      const targetUserId = payload.targetUserId;
      if (!targetUserId) return callback && callback({ error: 'Target required' });
      if (targetUserId === userId) return callback && callback({ error: 'Cannot vote for yourself' });

      // In revote phase, must vote for one of the tied candidates
      if (this.state.phase === 'revote' && this.revoteCandidates.length > 0) {
        if (!this.revoteCandidates.includes(targetUserId)) {
          return callback && callback({ error: 'Must vote for an eligible tied candidate' });
        }
      }

      const targetSecret = this.secretRoles.get(targetUserId);
      if (!targetSecret || !targetSecret.isAlive) {
        return callback && callback({ error: 'Cannot vote for eliminated players' });
      }

      this.dayVotes.set(userId, targetUserId);

      const pl = this.state.players.find(p => p.userId === userId);
      if (pl) pl.hasVoted = true;

      this.broadcastState();

      // Check if all living players have voted
      const livingCount = Array.from(this.secretRoles.values()).filter(s => s.isAlive).length;
      if (this.dayVotes.size >= livingCount) {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        this.resolveVotes(this.state.phase === 'revote');
      }

      return callback && callback({ ok: true, success: true });
    }

    // --- RESTART GAME / REMATCH ---
    if (action === 'restartGame') {
      if (this.room.hostId !== userId) {
        return callback && callback({ error: 'Only the host can start a rematch' });
      }
      this.start();
      return callback && callback({ ok: true, success: true });
    }

    return callback && callback({ error: 'Unknown action' });
  }

  broadcastState() {
    const payload = {
      gameKey: 'Mafia',
      state: this.state,
      ...this.state
    };
    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

module.exports = MafiaEngine;
