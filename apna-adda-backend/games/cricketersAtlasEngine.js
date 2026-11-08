// apna-adda-backend/games/cricketersAtlasEngine.js

const { CRICKETERS_DATABASE, findCricketer, cleanAlpha } = require('./cricketersDatabase');

class CricketersAtlasEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.timer = null;
    this.verificationTimeout = null;

    this.state = {
      players: room.players.map((p, idx) => ({
        id: p.userId || p._id || p.name || String(idx),
        userId: p.userId,
        name: p.name,
        score: 0,
        timeoutCount: 0,
        isEliminated: false,
        isActive: p.connected !== false
      })),
      currentPlayerIndex: 0,
      turnTimer: 30,
      requiredLetter: '', // Empty at start to allow starting with any cricketer
      lastPlayedCricketer: '',
      gameHistory: [],
      usedPlayerIds: [], // Stores canonical IDs e.g. 'ms-dhoni' or 'custom-xyz'
      usedCricketers: [], // Stores clean submitted strings
      pendingVerification: null, // Multiplayer community verification
      gameWinner: '',
      eliminatedMessage: '',
      verificationFeedback: ''
    };
  }

  start() {
    this.broadcastState();
    this.startTurnTimer();
  }

  broadcastState() {
    const payload = {
      roomId: this.room._id,
      gameKey: 'CricketersAtlas',
      state: this.state
    };
    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(this.room._id).emit('gameStateUpdate', payload);
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state.turnTimer = 30;

    this.timer = setInterval(() => {
      this.state.turnTimer -= 1;
      const tick = { turnTimer: this.state.turnTimer };
      this.io.to(`game_${this.room._id}`).emit('timerTick', tick);
      this.io.to(`room_${this.room._id}`).emit('timerTick', tick);
      this.io.to(this.room._id).emit('timerTick', tick);

      if (this.state.turnTimer <= 0) {
        clearInterval(this.timer);
        this.handleTimeUp();
      }
    }, 1000);
  }

  handleTimeUp() {
    if (this.verificationTimeout) {
      clearTimeout(this.verificationTimeout);
      this.verificationTimeout = null;
    }
    this.state.pendingVerification = null;

    const curr = this.state.players[this.state.currentPlayerIndex];
    if (!curr || curr.isEliminated) {
      this.nextTurn();
      return;
    }

    curr.timeoutCount = (curr.timeoutCount || 0) + 1;
    if (curr.timeoutCount >= 2) {
      curr.isEliminated = true;
      this.state.eliminatedMessage = `⚠️ ${curr.name} has been eliminated due to 2 consecutive timeouts!`;
    } else {
      this.state.eliminatedMessage = `⏰ Time's up for ${curr.name}! Turn passed. (Warning ${curr.timeoutCount}/2)`;
    }

    this.nextTurn();
  }

  nextTurn() {
    if (this.verificationTimeout) {
      clearTimeout(this.verificationTimeout);
      this.verificationTimeout = null;
    }
    this.state.pendingVerification = null;

    const active = this.state.players.filter(p => !p.isEliminated && p.isActive !== false);
    if (active.length <= 1) {
      if (active.length === 1) {
        this.state.gameWinner = active[0].name;
        this.state.eliminatedMessage = `🎉 ${active[0].name} wins the game!`;
      } else {
        this.state.gameWinner = 'No Winner';
        this.state.eliminatedMessage = 'Game over - no active players remaining!';
      }
      if (this.timer) clearInterval(this.timer);
      this.broadcastState();
      return;
    }

    let nextIdx = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while ((this.state.players[nextIdx].isEliminated || this.state.players[nextIdx].isActive === false) && attempts < this.state.players.length) {
      nextIdx = (nextIdx + 1) % this.state.players.length;
      attempts++;
    }

    this.state.currentPlayerIndex = nextIdx;
    this.startTurnTimer();
    this.broadcastState();
  }

  handleAction(userId, action, payload, callback) {
    const curr = this.state.players[this.state.currentPlayerIndex];

    // ==========================================
    // ACTION: submitCricketer
    // ==========================================
    if (action === 'submitCricketer') {
      const isMatch = curr.userId === userId || curr.id === userId;
      if (!isMatch) {
        return callback && callback({ error: "Not your turn!" });
      }

      if (this.state.pendingVerification) {
        return callback && callback({ error: "A community vote is currently in progress!" });
      }

      const rawName = (payload.name || payload.cricketer || '').trim();
      if (!rawName) return callback && callback({ error: "Please enter a cricketer name!" });

      const alphaOnly = cleanAlpha(rawName);
      if (alphaOnly.length < 2) {
        return callback && callback({ error: "Cricketer name must have at least 2 letters!" });
      }

      // First letter & Last letter strictly derived from alphabetic characters of SUBMITTED string
      const firstLetter = alphaOnly.charAt(0).toUpperCase();
      const lastLetter = alphaOnly.charAt(alphaOnly.length - 1).toUpperCase();

      // Atlas rule: Must start with the required letter (last letter of previous cricketer)
      if (this.state.requiredLetter && firstLetter !== this.state.requiredLetter.toUpperCase()) {
        return callback && callback({
          error: `Must start with "${this.state.requiredLetter.toUpperCase()}"! (You entered "${rawName}")`
        });
      }

      // 1. Check if raw clean name was already used
      const cleanLower = rawName.toLowerCase();
      const rawAlreadyUsed = this.state.usedCricketers && this.state.usedCricketers.some(u => {
        return u.toLowerCase() === cleanLower || cleanAlpha(u) === alphaOnly;
      });

      if (rawAlreadyUsed) {
        return callback && callback({ error: `"${rawName}" has already been used in this game!` });
      }

      // 2. Query rich cricketer database (300+ entries)
      const match = findCricketer(rawName);

      if (match.found && match.player) {
        const canonicalId = match.player.id;
        const canonicalName = match.player.canonicalName;

        // Check canonical duplicate tracking
        if (this.state.usedPlayerIds && this.state.usedPlayerIds.includes(canonicalId)) {
          return callback && callback({
            error: `"${canonicalName}" (or an alias like "${rawName}") has already been used in this game!`
          });
        }

        // Successfully verified cricketer
        curr.score = (curr.score || 0) + 1;
        curr.timeoutCount = 0; // Reset timeouts on successful turn

        // Strict Atlas chaining: Next letter is derived from the ACTUALLY SUBMITTED NAME
        this.state.requiredLetter = lastLetter;
        this.state.lastPlayedCricketer = rawName;

        if (!this.state.usedPlayerIds) this.state.usedPlayerIds = [];
        this.state.usedPlayerIds.push(canonicalId);

        if (!this.state.usedCricketers) this.state.usedCricketers = [];
        this.state.usedCricketers.push(cleanLower);

        this.state.gameHistory.push({
          player: curr.name,
          cricketer: rawName,
          canonicalName,
          country: match.player.country,
          role: match.player.role,
          letter: firstLetter,
          nextLetter: lastLetter,
          timestamp: new Date().toISOString(),
          isValid: true,
          verifiedBy: 'database'
        });

        this.nextTurn();
        return callback && callback({
          ok: true,
          success: true,
          isValid: true,
          canonicalName,
          nextLetter: lastLetter
        });
      } else {
        // Unknown player: Check if custom alpha is duplicate
        const customId = `custom-${alphaOnly}`;
        if (this.state.usedPlayerIds && this.state.usedPlayerIds.includes(customId)) {
          return callback && callback({ error: `"${rawName}" has already been used in this game!` });
        }

        // Multiplayer Community Verification
        const eligibleVoters = this.state.players.filter(
          p => !p.isEliminated && p.isActive !== false && p.userId !== curr.userId
        );

        // If no other voters present (solo play or all others disconnected), auto-approve
        if (eligibleVoters.length === 0) {
          curr.score = (curr.score || 0) + 1;
          curr.timeoutCount = 0;
          this.state.requiredLetter = lastLetter;
          this.state.lastPlayedCricketer = rawName;

          if (!this.state.usedPlayerIds) this.state.usedPlayerIds = [];
          this.state.usedPlayerIds.push(customId);

          if (!this.state.usedCricketers) this.state.usedCricketers = [];
          this.state.usedCricketers.push(cleanLower);

          this.state.gameHistory.push({
            player: curr.name,
            cricketer: rawName,
            letter: firstLetter,
            nextLetter: lastLetter,
            timestamp: new Date().toISOString(),
            isValid: true,
            verifiedBy: 'auto-solo'
          });

          this.nextTurn();
          return callback && callback({
            ok: true,
            success: true,
            isValid: true,
            nextLetter: lastLetter,
            autoApproved: true
          });
        }

        // Majority approval threshold: Math.floor(voters / 2) + 1
        const requiredApprovals = Math.floor(eligibleVoters.length / 2) + 1;

        this.state.pendingVerification = {
          id: Date.now().toString(),
          cricketer: rawName,
          firstLetter,
          lastLetter,
          customId,
          proposerId: curr.userId,
          proposerName: curr.name,
          eligibleVoterIds: eligibleVoters.map(v => v.userId),
          requiredApprovals,
          approvals: [],
          rejections: [],
          deadline: Date.now() + 20000
        };

        // 20-second voting countdown timer
        if (this.verificationTimeout) clearTimeout(this.verificationTimeout);
        this.verificationTimeout = setTimeout(() => {
          this.resolveVerificationTimeout();
        }, 20000);

        this.broadcastState();
        return callback && callback({
          ok: true,
          pendingVerification: true,
          message: "Waiting for other players to verify this cricketer..."
        });
      }
    }

    // ==========================================
    // ACTION: voteVerification / voteConsideration
    // ==========================================
    if (action === 'voteVerification' || action === 'voteConsideration') {
      const pv = this.state.pendingVerification;
      if (!pv) {
        return callback && callback({ error: "No pending verification in progress" });
      }

      // Proposer is strictly forbidden from voting on their own submission
      if (pv.proposerId === userId) {
        return callback && callback({ error: "You cannot vote on your own cricketer submission!" });
      }

      if (!pv.eligibleVoterIds.includes(userId)) {
        return callback && callback({ error: "You are not an eligible voter for this submission." });
      }

      if (pv.approvals.includes(userId) || pv.rejections.includes(userId)) {
        return callback && callback({ error: "You have already cast your vote." });
      }

      const isApprove = Boolean(
        payload.approve !== false &&
        payload.accept !== false &&
        payload.vote !== 'reject'
      );

      if (isApprove) {
        pv.approvals.push(userId);
      } else {
        pv.rejections.push(userId);
      }

      const proposerPlayer = this.state.players.find(p => p.userId === pv.proposerId);

      // Check if approval threshold reached
      if (pv.approvals.length >= pv.requiredApprovals) {
        if (this.verificationTimeout) {
          clearTimeout(this.verificationTimeout);
          this.verificationTimeout = null;
        }

        if (proposerPlayer) {
          proposerPlayer.score = (proposerPlayer.score || 0) + 1;
          proposerPlayer.timeoutCount = 0;
        }

        if (!this.state.usedPlayerIds) this.state.usedPlayerIds = [];
        this.state.usedPlayerIds.push(pv.customId);

        if (!this.state.usedCricketers) this.state.usedCricketers = [];
        this.state.usedCricketers.push(pv.cricketer.toLowerCase());

        this.state.requiredLetter = pv.lastLetter;
        this.state.lastPlayedCricketer = pv.cricketer;

        this.state.gameHistory.push({
          player: pv.proposerName,
          cricketer: pv.cricketer,
          letter: pv.firstLetter,
          nextLetter: pv.lastLetter,
          timestamp: new Date().toISOString(),
          isValid: true,
          verifiedBy: 'community-approved',
          votes: { approvals: pv.approvals.length, rejections: pv.rejections.length }
        });

        this.state.pendingVerification = null;
        this.nextTurn();
        return callback && callback({ ok: true, result: 'approved' });
      }

      // Check if rejection threshold reached (impossible for approvals to reach required majority)
      const remainingVotes = pv.eligibleVoterIds.length - (pv.approvals.length + pv.rejections.length);
      if (pv.approvals.length + remainingVotes < pv.requiredApprovals) {
        if (this.verificationTimeout) {
          clearTimeout(this.verificationTimeout);
          this.verificationTimeout = null;
        }

        this.state.gameHistory.push({
          player: pv.proposerName,
          cricketer: `${pv.cricketer} [REJECTED]`,
          letter: pv.firstLetter,
          nextLetter: this.state.requiredLetter,
          timestamp: new Date().toISOString(),
          isValid: false,
          verifiedBy: 'community-rejected',
          votes: { approvals: pv.approvals.length, rejections: pv.rejections.length }
        });

        this.state.verificationFeedback = `"${pv.cricketer}" was not approved by room voters.`;
        this.state.pendingVerification = null;
        this.nextTurn();
        return callback && callback({ ok: true, result: 'rejected' });
      }

      this.broadcastState();
      return callback && callback({ ok: true, voted: true });
    }

    // ==========================================
    // ACTION: restartGame
    // ==========================================
    if (action === 'restartGame') {
      const isHost = this.room.hostId === userId || this.state.players[0]?.userId === userId;
      if (!isHost) {
        return callback && callback({ error: "Only the host can restart the game" });
      }
      if (this.verificationTimeout) {
        clearTimeout(this.verificationTimeout);
        this.verificationTimeout = null;
      }
      this.state.players.forEach(p => {
        p.score = 0;
        p.timeoutCount = 0;
        p.isEliminated = false;
      });
      this.state.currentPlayerIndex = 0;
      this.state.requiredLetter = '';
      this.state.lastPlayedCricketer = '';
      this.state.gameHistory = [];
      this.state.usedPlayerIds = [];
      this.state.usedCricketers = [];
      this.state.gameWinner = '';
      this.state.eliminatedMessage = '';
      this.state.pendingVerification = null;
      this.state.verificationFeedback = '';
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  resolveVerificationTimeout() {
    const pv = this.state.pendingVerification;
    if (!pv) return;

    this.verificationTimeout = null;
    const proposerPlayer = this.state.players.find(p => p.userId === pv.proposerId);

    // If approvals > rejections, approve; otherwise reject
    if (pv.approvals.length > pv.rejections.length) {
      if (proposerPlayer) {
        proposerPlayer.score = (proposerPlayer.score || 0) + 1;
        proposerPlayer.timeoutCount = 0;
      }
      if (!this.state.usedPlayerIds) this.state.usedPlayerIds = [];
      this.state.usedPlayerIds.push(pv.customId);
      if (!this.state.usedCricketers) this.state.usedCricketers = [];
      this.state.usedCricketers.push(pv.cricketer.toLowerCase());

      this.state.requiredLetter = pv.lastLetter;
      this.state.lastPlayedCricketer = pv.cricketer;

      this.state.gameHistory.push({
        player: pv.proposerName,
        cricketer: pv.cricketer,
        letter: pv.firstLetter,
        nextLetter: pv.lastLetter,
        timestamp: new Date().toISOString(),
        isValid: true,
        verifiedBy: 'community-timeout-approved',
        votes: { approvals: pv.approvals.length, rejections: pv.rejections.length }
      });
    } else {
      this.state.gameHistory.push({
        player: pv.proposerName,
        cricketer: `${pv.cricketer} [REJECTED]`,
        letter: pv.firstLetter,
        nextLetter: this.state.requiredLetter,
        timestamp: new Date().toISOString(),
        isValid: false,
        verifiedBy: 'community-timeout-rejected',
        votes: { approvals: pv.approvals.length, rejections: pv.rejections.length }
      });
      this.state.verificationFeedback = `Vote timed out. "${pv.cricketer}" was not confirmed.`;
    }

    this.state.pendingVerification = null;
    this.nextTurn();
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.verificationTimeout) clearTimeout(this.verificationTimeout);
  }
}

module.exports = CricketersAtlasEngine;
