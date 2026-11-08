// apna-adda-backend/games/mrWhiteEngine.js
const { secureChoice, secureRandomIndex } = require('../utils/secureRandom');

const WORD_PAIRS = [
  // Fruits
  { majority: 'Apple', mrWhite: 'Mango', category: 'Fruits' },
  { majority: 'Orange', mrWhite: 'Lemon', category: 'Fruits' },
  { majority: 'Banana', mrWhite: 'Plantain', category: 'Fruits' },
  { majority: 'Grapes', mrWhite: 'Berries', category: 'Fruits' },
  { majority: 'Watermelon', mrWhite: 'Cantaloupe', category: 'Fruits' },
  // Animals
  { majority: 'Lion', mrWhite: 'Tiger', category: 'Animals' },
  { majority: 'Dog', mrWhite: 'Wolf', category: 'Animals' },
  { majority: 'Elephant', mrWhite: 'Rhino', category: 'Animals' },
  { majority: 'Eagle', mrWhite: 'Hawk', category: 'Animals' },
  { majority: 'Dolphin', mrWhite: 'Whale', category: 'Animals' },
  // Vehicles
  { majority: 'Car', mrWhite: 'Truck', category: 'Vehicles' },
  { majority: 'Bicycle', mrWhite: 'Motorcycle', category: 'Vehicles' },
  { majority: 'Airplane', mrWhite: 'Helicopter', category: 'Vehicles' },
  { majority: 'Train', mrWhite: 'Metro', category: 'Vehicles' },
  { majority: 'Boat', mrWhite: 'Ship', category: 'Vehicles' },
  // Food
  { majority: 'Pizza', mrWhite: 'Burger', category: 'Food' },
  { majority: 'Rice', mrWhite: 'Wheat', category: 'Food' },
  { majority: 'Chocolate', mrWhite: 'Candy', category: 'Food' },
  { majority: 'Coffee', mrWhite: 'Tea', category: 'Food' },
  { majority: 'Bread', mrWhite: 'Roti', category: 'Food' },
  // Sports
  { majority: 'Cricket', mrWhite: 'Baseball', category: 'Sports' },
  { majority: 'Football', mrWhite: 'Rugby', category: 'Sports' },
  { majority: 'Tennis', mrWhite: 'Badminton', category: 'Sports' },
  { majority: 'Swimming', mrWhite: 'Diving', category: 'Sports' },
  { majority: 'Basketball', mrWhite: 'Volleyball', category: 'Sports' },
  // Colors
  { majority: 'Red', mrWhite: 'Pink', category: 'Colors' },
  { majority: 'Blue', mrWhite: 'Navy', category: 'Colors' },
  { majority: 'Green', mrWhite: 'Lime', category: 'Colors' },
  { majority: 'Yellow', mrWhite: 'Gold', category: 'Colors' },
  { majority: 'Purple', mrWhite: 'Violet', category: 'Colors' },
  // Weather
  { majority: 'Rain', mrWhite: 'Storm', category: 'Weather' },
  { majority: 'Snow', mrWhite: 'Hail', category: 'Weather' },
  { majority: 'Sunny', mrWhite: 'Bright', category: 'Weather' },
  { majority: 'Wind', mrWhite: 'Breeze', category: 'Weather' },
  { majority: 'Cloud', mrWhite: 'Fog', category: 'Weather' },
  // Objects
  { majority: 'Book', mrWhite: 'Magazine', category: 'Objects' },
  { majority: 'Phone', mrWhite: 'Tablet', category: 'Objects' },
  { majority: 'Chair', mrWhite: 'Stool', category: 'Objects' },
  { majority: 'Pen', mrWhite: 'Pencil', category: 'Objects' },
  { majority: 'Watch', mrWhite: 'Clock', category: 'Objects' },
  // Professions
  { majority: 'Doctor', mrWhite: 'Nurse', category: 'Professions' },
  { majority: 'Teacher', mrWhite: 'Professor', category: 'Professions' },
  { majority: 'Chef', mrWhite: 'Cook', category: 'Professions' },
  { majority: 'Pilot', mrWhite: 'Captain', category: 'Professions' },
  { majority: 'Engineer', mrWhite: 'Architect', category: 'Professions' }
];

class MrWhiteEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.wordPair = null;
    this.mrWhitePlayerId = null;
    this.mrWhitePlayerName = null;
    this.state = {
      players: room.players.map(p => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        isHost: p.userId === room.hostId,
        hasFlippedCard: false,
        votes: 0,
        hasVoted: false
      })),
      gamePhase: 'clues', // 'clues' | 'voting' | 'mrwhite_guess' | 'finished'
      phase: 'clues',
      votingResults: [],
      mrWhiteGuess: '',
      gameWinner: '', // 'majority' | 'mrwhite'
      chatMessages: [],
      category: '',
      // Revealed summary only populated when finished!
      revealedSummary: null
    };
  }

  start() {
    this.wordPair = secureChoice(WORD_PAIRS);
    this.state.category = this.wordPair.category;

    // Cryptographically secure secret role assignment:
    // Ensures equal probability across all eligible players without seat or index bias
    const eligiblePlayers = this.state.players.filter(p => p.connected !== false);
    const pool = eligiblePlayers.length > 0 ? eligiblePlayers : this.state.players;
    const chosenMrWhite = secureChoice(pool);
    this.mrWhitePlayerId = chosenMrWhite.userId;
    this.mrWhitePlayerName = chosenMrWhite.name;

    this.state.gamePhase = 'clues';
    this.state.votingResults = [];
    this.state.mrWhiteGuess = '';
    this.state.gameWinner = '';
    this.state.revealedSummary = null;
    this.state.players.forEach(p => {
      p.votes = 0;
      p.hasVoted = false;
      p.hasFlippedCard = false;
    });

    this.broadcastState();
  }

  // Authoritatively send private card info to a specific player
  getPrivateCard(userId) {
    if (!this.wordPair) return null;
    const isMrWhite = userId === this.mrWhitePlayerId;
    return {
      role: isMrWhite ? 'mrwhite' : 'majority',
      isMrWhite,
      word: isMrWhite ? this.wordPair.mrWhite : this.wordPair.majority,
      category: this.wordPair.category
    };
  }

  broadcastState() {
    this.state.phase = this.state.gamePhase;
    // Public state emitted to all players
    const publicState = { ...this.state, phase: this.state.gamePhase };
    if (this.state.gamePhase !== 'finished') {
      publicState.mrWhitePlayerName = null;
    } else {
      publicState.mrWhitePlayerName = this.mrWhitePlayerName;
    }

    const payload = {
      gameKey: 'MrWhite',
      state: publicState,
      ...publicState
    };

    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);

    // Also push private role info to each connected socket for their user
    this.room.players.forEach(p => {
      const privateCard = this.getPrivateCard(p.userId);
      if (privateCard) {
        this.io.to(`player_${p.userId}`).emit('privateStateUpdate', {
          gameKey: 'MrWhite',
          privateCard,
          ...privateCard
        });
        this.io.to(`player_${p.userId}`).emit('privateCard', privateCard);
      }
    });
  }

  handleAction(userId, action, payload, callback) {
    if (action === 'getPrivateCard') {
      const card = this.getPrivateCard(userId);
      return callback && callback({ ok: true, card });
    }

    if (action === 'sendChat' || action === 'submitClue') {
      const msg = (payload.message || payload.clue || '').trim();
      if (!msg) return callback && callback({ error: "Empty message" });
      const p = this.state.players.find(x => x.userId === userId);
      const chatItem = {
        id: Date.now().toString(),
        player: p ? p.name : 'Unknown',
        message: msg,
        timestamp: new Date().toISOString()
      };
      this.state.chatMessages.push(chatItem);
      this.broadcastState();
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'flipCard') {
      const p = this.state.players.find(x => x.userId === userId);
      if (p) {
        p.hasFlippedCard = !p.hasFlippedCard;
        this.broadcastState();
      }
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'startVoting') {
      // Host or player can start voting
      this.state.gamePhase = 'voting';
      this.state.players.forEach(p => {
        p.votes = 0;
        p.hasVoted = false;
      });
      this.broadcastState();
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'votePlayer' || action === 'submitVote') {
      if (this.state.gamePhase !== 'voting') {
        return callback && callback({ error: "Voting is not active" });
      }
      const voter = this.state.players.find(p => p.userId === userId);
      if (!voter) return callback && callback({ error: "Player not found" });
      if (voter.hasVoted) return callback && callback({ error: "Already voted" });

      const targetId = payload.targetUserId || payload.targetPlayerId || payload.targetId;
      const target = this.state.players.find(p => p.userId === targetId || p.id === targetId);
      if (!target) return callback && callback({ error: "Target player not found" });

      target.votes = (target.votes || 0) + 1;
      voter.hasVoted = true;

      // Check if all active players have voted
      const allVoted = this.state.players.every(p => p.hasVoted);
      if (allVoted) {
        this.finishVoting();
      } else {
        this.broadcastState();
      }
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'finishVoting') {
      // Host can forcibly conclude voting if needed
      if (this.room.hostId !== userId && !this.state.players.every(p => p.hasVoted)) {
        return callback && callback({ error: "Only host can finish voting early" });
      }
      this.finishVoting();
      return callback && callback({ ok: true });
    }

    if (action === 'submitMrWhiteGuess') {
      if (this.state.gamePhase !== 'mrwhite_guess') {
        return callback && callback({ error: "Not in guess phase" });
      }
      if (userId !== this.mrWhitePlayerId) {
        return callback && callback({ error: "Only Mr. White can make this guess" });
      }

      const guess = (payload.guess || '').trim().toLowerCase();
      this.state.mrWhiteGuess = payload.guess;
      const actual = this.wordPair.majority.toLowerCase();

      if (guess === actual) {
        this.state.gameWinner = 'mrwhite';
      } else {
        this.state.gameWinner = 'majority';
      }

      this.finishGame();
      return callback && callback({ ok: true });
    }

    if (action === 'restartGame') {
      if (this.room.hostId !== userId) {
        return callback && callback({ error: "Only host can restart" });
      }
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  finishVoting() {
    const results = this.state.players
      .map(p => ({ player: p.name, userId: p.userId, votes: p.votes }))
      .sort((a, b) => b.votes - a.votes);

    this.state.votingResults = results;
    const mostVoted = results[0];

    if (mostVoted && mostVoted.userId === this.mrWhitePlayerId) {
      // Mr White was caught! Last chance guess
      this.state.gamePhase = 'mrwhite_guess';
    } else {
      // Innocent player eliminated! Mr White wins
      this.state.gameWinner = 'mrwhite';
      this.finishGame();
    }
    this.broadcastState();
  }

  finishGame() {
    this.state.gamePhase = 'finished';
    this.state.revealedSummary = {
      majorityWord: this.wordPair.majority,
      mrWhiteWord: this.wordPair.mrWhite,
      mrWhiteName: this.mrWhitePlayerName,
      category: this.wordPair.category
    };
    this.broadcastState();
  }

  destroy() {}
}

module.exports = MrWhiteEngine;
