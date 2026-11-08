// apna-adda-backend/games/spyGameEngine.js
const { secureChoice, secureRandomIndex } = require('../utils/secureRandom');

const LOCATIONS = [
  'Hospital', 'Airport', 'Restaurant', 'Library', 'Beach', 'Hotel', 'Casino',
  'School', 'Factory', 'Space Station', 'Cruise Ship', 'Movie Set', 'Amusement Park',
  'Submarine', 'Train Station', 'Police Station', 'Hospitality Suite', 'Zoo', 'Gym',
  'Theater', 'Fire Station', 'Shopping Mall', 'Sports Stadium', 'Embassy', 'Nightclub',
  'Cemetery', 'University Campus', 'Power Plant', 'Courtroom', 'Aquarium', 'Concert Hall',
  'Television Studio', 'Bus Station', 'Military Base', 'Science Lab', 'Botanical Garden',
  'Ski Resort', 'Golf Course', 'Prison', 'Circus', 'Observatory', 'Farm', 'Desert Tent',
  'Mountain Cabin', 'Art Gallery', 'Ferry Terminal', 'Bakery', 'Garage', 'Race Track', 'Park'
];

class SpyGameEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.currentLocation = null;
    this.spyPlayerId = null;
    this.spyPlayerName = null;
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
      gamePhase: 'playing', // 'playing' | 'voting' | 'finished'
      chatMessages: [],
      gameWinner: '', // 'civilians' | 'spy'
      winReason: '',
      revealedSummary: null
    };
  }

  start() {
    this.currentLocation = secureChoice(LOCATIONS);
    const eligiblePlayers = this.state.players.filter(p => p.connected !== false);
    const pool = eligiblePlayers.length > 0 ? eligiblePlayers : this.state.players;
    const chosenSpy = secureChoice(pool);
    this.spyPlayerId = chosenSpy.userId;
    this.spyPlayerName = chosenSpy.name;

    this.state.gamePhase = 'playing';
    this.state.gameWinner = '';
    this.state.winReason = '';
    this.state.revealedSummary = null;
    this.state.players.forEach(p => {
      p.hasFlippedCard = false;
      p.votes = 0;
      p.hasVoted = false;
    });

    this.broadcastState();
  }

  getPrivateCard(userId) {
    if (!this.currentLocation) return null;
    if (userId === this.spyPlayerId) {
      return {
        role: 'spy',
        isSpy: true,
        location: '???'
      };
    } else {
      return {
        role: 'civilian',
        isSpy: false,
        location: this.currentLocation
      };
    }
  }

  broadcastState() {
    const publicState = {
      ...this.state,
      // hide location and spy unless finished
      currentLocation: this.state.gamePhase === 'finished' ? this.currentLocation : null,
      spyPlayerName: this.state.gamePhase === 'finished' ? this.spyPlayerName : null
    };

    const payload = {
      gameKey: 'SpyGame',
      state: publicState,
      ...publicState
    };

    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);

    // Send private cards to each player's socket room
    this.room.players.forEach(p => {
      const card = this.getPrivateCard(p.userId);
      if (card) {
        this.io.to(`player_${p.userId}`).emit('privateStateUpdate', {
          gameKey: 'SpyGame',
          privateCard: card,
          ...card
        });
        this.io.to(`player_${p.userId}`).emit('privateCard', card);
      }
    });
  }

  handleAction(userId, action, payload, callback) {
    if (action === 'getPrivateCard') {
      return callback && callback({ ok: true, card: this.getPrivateCard(userId) });
    }

    if (action === 'sendChat') {
      const msg = (payload.message || '').trim();
      if (!msg) return callback && callback({ error: "Empty message" });
      const p = this.state.players.find(x => x.userId === userId);
      this.state.chatMessages.push({
        id: Date.now().toString(),
        player: p ? p.name : 'Unknown',
        message: msg,
        timestamp: new Date().toISOString()
      });
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'flipCard') {
      const p = this.state.players.find(x => x.userId === userId);
      if (p) {
        p.hasFlippedCard = !p.hasFlippedCard;
        this.broadcastState();
      }
      return callback && callback({ ok: true });
    }

    if (action === 'startVoting') {
      this.state.gamePhase = 'voting';
      this.state.players.forEach(p => {
        p.votes = 0;
        p.hasVoted = false;
      });
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'votePlayer') {
      if (this.state.gamePhase !== 'voting') {
        return callback && callback({ error: "Not voting phase" });
      }
      const voter = this.state.players.find(p => p.userId === userId);
      if (!voter || voter.hasVoted) return callback && callback({ error: "Cannot vote" });

      const targetId = payload.targetUserId || payload.targetPlayerId;
      const target = this.state.players.find(p => p.userId === targetId || p.id === targetId);
      if (!target) return callback && callback({ error: "Target player not found" });

      target.votes = (target.votes || 0) + 1;
      voter.hasVoted = true;

      const allVoted = this.state.players.every(p => p.hasVoted);
      if (allVoted) {
        this.finishVoting();
      } else {
        this.broadcastState();
      }
      return callback && callback({ ok: true });
    }

    if (action === 'finishVoting') {
      if (this.room.hostId !== userId && !this.state.players.every(p => p.hasVoted)) {
        return callback && callback({ error: "Host only" });
      }
      this.finishVoting();
      return callback && callback({ ok: true });
    }

    // Spy can guess location to win anytime
    if (action === 'spyGuessLocation') {
      if (userId !== this.spyPlayerId) {
        return callback && callback({ error: "Only the spy can guess location" });
      }
      const guess = (payload.location || '').trim().toLowerCase();
      if (guess === this.currentLocation.toLowerCase()) {
        this.state.gameWinner = 'spy';
        this.state.winReason = `The Spy (${this.spyPlayerName}) correctly guessed the location: ${this.currentLocation}!`;
      } else {
        this.state.gameWinner = 'civilians';
        this.state.winReason = `The Spy guessed wrong ("${payload.location}"). The real location was ${this.currentLocation}!`;
      }
      this.state.gamePhase = 'finished';
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'restartGame') {
      if (this.room.hostId !== userId) return callback && callback({ error: "Host only" });
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  finishVoting() {
    const results = this.state.players
      .map(p => ({ player: p.name, userId: p.userId, votes: p.votes }))
      .sort((a, b) => b.votes - a.votes);

    const mostVoted = results[0];
    if (mostVoted && mostVoted.userId === this.spyPlayerId) {
      this.state.gameWinner = 'civilians';
      this.state.winReason = `The civilians caught the spy (${this.spyPlayerName})!`;
    } else {
      this.state.gameWinner = 'spy';
      this.state.winReason = `The civilians eliminated ${mostVoted?.player || 'the wrong person'}, allowing the spy to escape!`;
    }
    this.state.gamePhase = 'finished';
    this.broadcastState();
  }

  destroy() {}
}

module.exports = SpyGameEngine;
