// apna-adda-backend/roomManager.js

const CricketersAtlasEngine = require("./games/cricketersAtlasEngine");
const MrWhiteEngine = require("./games/mrWhiteEngine");
const WhoAmIEngine = require("./games/whoAmIEngine");
const SpyGameEngine = require("./games/spyGameEngine");
const DumbCharadesEngine = require("./games/dumbCharadesEngine");
const HollywoodBollywoodEngine = require("./games/hollywoodBollywoodEngine");
const MafiaEngine = require("./games/mafiaEngine");
const BluffMastersEngine = require("./games/bluffMastersEngine");

function normalizeGameKey(key) {
  if (!key) return "";
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("bluff")) return "BluffMasters";
  if (clean.includes("atlas") || clean.includes("cricketer")) return "CricketersAtlas";
  if (clean.includes("white")) return "MrWhite";
  if (clean.includes("whoami")) return "WhoAmI";
  if (clean.includes("spy")) return "SpyGame";
  if (clean.includes("charade")) return "DumbCharades";
  if (clean.includes("hollywood") || clean.includes("bollywood")) return "HollywoodBollywoodGame";
  if (clean.includes("mafia")) return "Mafia";
  return key;
}

const GAME_CONFIGS = {
  BluffMasters: {
    name: "Bluff Masters",
    minPlayers: 3,
    maxPlayers: 10,
    exactCount: false,
    requiresReady: false,
    description: "Social deception party game: Spot the Bluffer with the different question! (3-10 players)"
  },
  Mafia: {
    name: "Mafia",
    minPlayers: 5,
    maxPlayers: 16,
    exactCount: true, // Mafia requires exactly the configured player count (5-16) to ensure balanced role distribution
    requiresReady: true,
    description: "Classic social deduction (5-16 players)"
  },
  MrWhite: {
    name: "Mr. White",
    minPlayers: 3,
    maxPlayers: 12,
    exactCount: false,
    requiresReady: false,
    description: "Find the impostor with the secret word (3-12 players)"
  },
  SpyGame: {
    name: "Spy Game",
    minPlayers: 3,
    maxPlayers: 12,
    exactCount: false,
    requiresReady: false,
    description: "Find the spy among your friends (3-12 players)"
  },
  DumbCharades: {
    name: "Dumb Charades",
    minPlayers: 2,
    maxPlayers: 16,
    exactCount: false,
    requiresReady: false,
    description: "Act out movies without speaking (2-16 players)"
  },
  CricketersAtlas: {
    name: "Cricketers Atlas",
    minPlayers: 2,
    maxPlayers: 10,
    exactCount: false,
    requiresReady: false,
    description: "Alphabetical cricketer chain game (2-10 players)"
  },
  HollywoodBollywoodGame: {
    name: "Hollywood-Bollywood",
    minPlayers: 2,
    maxPlayers: 10,
    exactCount: false,
    requiresReady: false,
    description: "Guess Actor, Actress, Movie & Song from initials (2-10 players)"
  },
  WhoAmI: {
    name: "Who Am I?",
    minPlayers: 2,
    maxPlayers: 10,
    exactCount: false,
    requiresReady: false,
    description: "Guess the celebrity through Yes/No questions (2-10 players)"
  }
};

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> Room
    this.socketToUser = new Map(); // socketId -> { roomId, userId }
    this.gameEngines = new Map(); // roomId -> Engine instance
    this.disconnectTimers = new Map(); // userId -> timer
    this.gracePeriod = process.env.NODE_ENV === "test" ? 100 : 60000;

    // Periodic cleanup of stale/empty rooms (rooms older than 6 hours or empty for 15 mins)
    setInterval(() => this.cleanupRooms(), 60000);
  }

  genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  genCode() {
    // Clean 4-character uppercase code without ambiguous chars
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  findRoom(identifier) {
    if (!identifier) return null;
    const rawId = String(identifier).trim();
    const cleanId = rawId.toUpperCase();
    for (const room of this.rooms.values()) {
      if (room._id === rawId || room.id === rawId || room.code === cleanId) {
        return room;
      }
    }
    return null;
  }

  getRoom(identifier) {
    return this.findRoom(identifier);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(r => ({
      _id: r._id,
      code: r.code,
      name: r.name,
      gameKey: r.gameKey,
      maxPlayers: r.maxPlayers,
      hostId: r.hostId,
      players: r.players.map(p => ({
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        isReady: Boolean(p.isReady),
        isHost: p.userId === r.hostId,
        connected: p.connected !== false
      })),
      status: r.status,
      createdAt: r.createdAt
    }));
  }

  createRoom({ name, gameKey, maxPlayers, hostId, hostName }) {
    if (!gameKey) throw new Error("gameKey is required");
    const normalizedKey = normalizeGameKey(gameKey);
    const config = GAME_CONFIGS[normalizedKey] || { minPlayers: 2, maxPlayers: 16 };

    let code = this.genCode();
    while (this.findRoom(code)) {
      code = this.genCode();
    }

    const _id = this.genId();
    let configuredMax;
    if (normalizedKey === "Mafia") {
      configuredMax = Math.max(5, Math.min(16, parseInt(maxPlayers, 10) || 6));
    } else {
      configuredMax = Math.max(config.minPlayers, Math.min(config.maxPlayers, parseInt(maxPlayers, 10) || 6));
    }

    const safeHostId = hostId || "host-" + Math.random().toString(36).slice(2, 8);
    const safeHostName = hostName || "Host";

    const room = {
      _id,
      id: _id,
      code,
      name: name || `${safeHostName}'s Adda`,
      gameKey: normalizedKey,
      maxPlayers: configuredMax,
      hostId: safeHostId,
      players: [
        {
          userId: safeHostId,
          name: safeHostName,
          score: 0,
          isReady: true,
          isHost: true,
          connected: true,
          socketId: null
        }
      ],
      status: "waiting", // 'waiting' | 'active' | 'finished'
      isStarting: false,
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.rooms.set(_id, room);
    return room;
  }

  joinRoom(socket, { code, roomId, roomIdentifier, userId, name }) {
    const room = this.findRoom(code || roomId || roomIdentifier);
    if (!room) {
      throw new Error("Room not found. Please check the room code.");
    }

    room.lastActive = Date.now();

    // Cancel pending disconnect timer for this user if reconnecting
    if (userId && this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
      this.disconnectTimers.delete(userId);
    }

    // Check if player already in room (reconnection or existing session)
    let player = room.players.find(p => p.userId === userId);
    if (player) {
      player.connected = true;
      player.socketId = socket.id;
      if (name && name.trim()) player.name = name.trim();
      // Ensure host flag is accurate
      player.isHost = player.userId === room.hostId;
      if (player.isHost) player.isReady = true;
    } else {
      // New player attempting to join
      if (room.status === "active") {
        throw new Error("Game is already in progress in this room. Late joining is not allowed.");
      }
      if (room.players.length >= room.maxPlayers) {
        throw new Error(`Room is full (maximum ${room.maxPlayers} players).`);
      }

      player = {
        userId,
        name: (name && name.trim()) || `Player ${room.players.length + 1}`,
        score: 0,
        isReady: userId === room.hostId, // Host is always ready by default
        isHost: userId === room.hostId,
        connected: true,
        socketId: socket.id
      };
      room.players.push(player);
    }

    // Join socket channels
    socket.join(`room_${room._id}`);
    socket.join(`player_${userId}`);
    this.socketToUser.set(socket.id, { roomId: room._id, userId });

    // If game already active, also join game room
    if (room.status === "active") {
      socket.join(`game_${room._id}`);
    }

    this.broadcastRoomUpdate(room);

    // If game engine exists and is active, send current game state to all players
    const engine = this.gameEngines.get(room._id);
    if (engine) {
      engine.broadcastState();
    }

    return {
      ok: true,
      success: true,
      roomId: room._id,
      code: room.code,
      gameKey: room.gameKey,
      isHost: room.hostId === userId,
      status: room.status,
      room: {
        _id: room._id,
        roomId: room._id,
        code: room.code,
        name: room.name,
        gameKey: room.gameKey,
        maxPlayers: room.maxPlayers,
        hostId: room.hostId,
        status: room.status,
        players: room.players.map(p => ({
          userId: p.userId,
          name: p.name,
          score: p.score || 0,
          isReady: Boolean(p.isReady),
          isHost: p.userId === room.hostId,
          connected: p.connected !== false
        }))
      }
    };
  }

  joinGameChannel(socket, { roomId, userId }) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");

    socket.join(`game_${room._id}`);
    socket.join(`player_${userId}`);
    this.socketToUser.set(socket.id, { roomId: room._id, userId });

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.connected = true;
      player.socketId = socket.id;
    }

    const engine = this.gameEngines.get(room._id);
    if (engine) {
      engine.broadcastState();
    } else {
      this.io.to(`game_${room._id}`).emit("playersUpdate", room.players);
    }

    return { ok: true };
  }

  toggleReady(userId, roomId) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");

    const player = room.players.find(p => p.userId === userId);
    if (!player) throw new Error("Player not in room");

    // Host is always ready
    if (player.userId === room.hostId) {
      player.isReady = true;
      this.broadcastRoomUpdate(room);
      return { ok: true, success: true, isReady: true };
    }

    player.isReady = !player.isReady;
    this.broadcastRoomUpdate(room);
    return { ok: true, success: true, isReady: player.isReady };
  }

  leaveRoom(socket, { roomId, userId }) {
    const room = this.findRoom(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.userId !== userId);
    socket.leave(`room_${room._id}`);
    socket.leave(`game_${room._id}`);
    this.socketToUser.delete(socket.id);

    if (room.players.length === 0) {
      this.cleanupRoom(room._id);
      return;
    }

    // Host migration if host permanently left
    if (room.hostId === userId && room.players.length > 0) {
      const nextHost = room.players.find(p => p.connected) || room.players[0];
      room.hostId = nextHost.userId;
      nextHost.isHost = true;
      nextHost.isReady = true;
    }

    this.broadcastRoomUpdate(room);
  }

  kickPlayer(hostUserId, { roomId, targetUserId }) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== hostUserId) throw new Error("Only the room host can remove players");
    if (hostUserId === targetUserId) throw new Error("Cannot kick yourself");

    const target = room.players.find(p => p.userId === targetUserId);
    if (target && target.socketId) {
      const targetSocket = this.io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.leave(`room_${room._id}`);
        targetSocket.leave(`game_${room._id}`);
        targetSocket.emit("kickedFromRoom", { message: "You were removed from the room by the host" });
        targetSocket.emit("kicked", { message: "You were removed from the room by the host" });
      }
    }

    room.players = room.players.filter(p => p.userId !== targetUserId);
    this.broadcastRoomUpdate(room);
    return { ok: true, success: true };
  }

  /**
   * PHASE 3: Authoritative Server-Side Start Validation
   * Validates room state, host permissions, exact/min player count, connected players, and ready status.
   */
  validateCanStart(room, userId) {
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "waiting") {
      throw new Error("The game has already started or is no longer waiting.");
    }

    if (room.isStarting) {
      throw new Error("Game initialization is already in progress. Please wait.");
    }

    if (room.hostId !== userId) {
      throw new Error("Only the room host can start the game.");
    }

    const key = normalizeGameKey(room.gameKey);
    const config = GAME_CONFIGS[key] || { minPlayers: 2, maxPlayers: 16, requiresReady: true };

    // Player count validation
    const currentCount = room.players.length;

    if (config.exactCount) {
      // Exact player count game (e.g., Mafia configured for N players)
      const required = room.maxPlayers;
      if (currentCount < required) {
        const diff = required - currentCount;
        throw new Error(
          `Cannot start: ${config.name} is configured for ${required} players. ` +
          `Currently ${currentCount} joined. Waiting for ${diff} more player${diff > 1 ? "s" : ""}.`
        );
      }
      if (currentCount > required) {
        throw new Error(`Cannot start: Player count (${currentCount}) exceeds the configured limit of ${required}.`);
      }
    } else {
      // Flexible player count game
      if (currentCount < config.minPlayers) {
        const diff = config.minPlayers - currentCount;
        throw new Error(
          `Cannot start: ${config.name} requires at least ${config.minPlayers} players to start. ` +
          `Currently ${currentCount} joined. Waiting for ${diff} more player${diff > 1 ? "s" : ""}.`
        );
      }
      if (currentCount > config.maxPlayers) {
        throw new Error(`Cannot start: ${config.name} allows a maximum of ${config.maxPlayers} players.`);
      }
    }

    // Verify all players are connected
    const disconnected = room.players.filter(p => p.connected === false);
    if (disconnected.length > 0) {
      throw new Error(
        `Cannot start: Player "${disconnected[0].name}" is disconnected. ` +
        `Please wait for them to reconnect or remove them from the room.`
      );
    }

    // Verify ready status if required
    if (config.requiresReady) {
      const notReady = room.players.filter(p => p.userId !== room.hostId && !p.isReady);
      if (notReady.length > 0) {
        const names = notReady.map(p => p.name).join(", ");
        throw new Error(`Cannot start: Waiting for ${names} to mark themselves as Ready.`);
      }
    }

    return true;
  }

  startRoom(userId, roomId) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");

    // Perform strict server-side validation
    this.validateCanStart(room, userId);

    // Prevent concurrent start requests (atomic lock)
    room.isStarting = true;
    room.status = "active";
    room.lastActive = Date.now();

    // Normalize game key
    const normalizedKey = normalizeGameKey(room.gameKey);
    room.gameKey = normalizedKey;

    // Instantiate appropriate game engine
    let engine = null;
    switch (room.gameKey) {
      case "BluffMasters":
        engine = new BluffMastersEngine(room, this.io);
        break;
      case "CricketersAtlas":
        engine = new CricketersAtlasEngine(room, this.io);
        break;
      case "MrWhite":
        engine = new MrWhiteEngine(room, this.io);
        break;
      case "WhoAmI":
        engine = new WhoAmIEngine(room, this.io);
        break;
      case "SpyGame":
        engine = new SpyGameEngine(room, this.io);
        break;
      case "DumbCharades":
        engine = new DumbCharadesEngine(room, this.io);
        break;
      case "HollywoodBollywoodGame":
        engine = new HollywoodBollywoodEngine(room, this.io);
        break;
      case "Mafia":
        engine = new MafiaEngine(room, this.io);
        break;
      default:
        console.warn("Unknown gameKey:", room.gameKey);
    }

    // Join all sockets in room to game channel
    const roomChannel = this.io.sockets.adapter.rooms.get(`room_${room._id}`);
    if (roomChannel) {
      for (const socketId of roomChannel) {
        const s = this.io.sockets.sockets.get(socketId);
        if (s) {
          s.join(`game_${room._id}`);
        }
      }
    }

    if (engine) {
      if (this.gameEngines.has(room._id)) {
        this.gameEngines.get(room._id).destroy();
      }
      this.gameEngines.set(room._id, engine);
      engine.start();
    }

    // Broadcast roomStarted event
    const startPayload = {
      roomId: room._id,
      gameKey: room.gameKey,
      code: room.code
    };

    this.io.to(`room_${room._id}`).emit("roomStarted", startPayload);
    this.io.to(`game_${room._id}`).emit("roomStarted", startPayload);
    this.broadcastRoomUpdate(room);

    room.isStarting = false;
    return { ok: true, success: true, roomId: room._id, gameKey: room.gameKey };
  }

  handleGameAction(userId, { roomId, action, payload }, callback) {
    const room = this.findRoom(roomId);
    if (!room) return callback && callback({ error: "Room not found" });

    const engine = this.gameEngines.get(room._id);
    if (!engine) return callback && callback({ error: "Game not active" });

    engine.handleAction(userId, action, payload || {}, callback);
  }

  /**
   * PHASE 9: Reconnection Grace Period Handling
   * Temporary network drops or page reloads do not immediately strip host status or progress.
   */
  handleDisconnect(socket) {
    const entry = this.socketToUser.get(socket.id);
    if (!entry) return;

    const { roomId, userId } = entry;
    this.socketToUser.delete(socket.id);

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.connected = false;
      player.disconnectedAt = Date.now();
    }

    // If host disconnected during waiting phase, schedule grace period (60s) before migrating host
    if (room.hostId === userId && room.status === "waiting") {
      if (this.disconnectTimers.has(userId)) {
        clearTimeout(this.disconnectTimers.get(userId));
      }

      const timer = setTimeout(() => {
        this.disconnectTimers.delete(userId);
        const r = this.rooms.get(roomId);
        if (!r) return;
        const p = r.players.find(pl => pl.userId === userId);
        if (p && !p.connected && r.status === "waiting") {
          const nextConnected = r.players.find(pl => pl.connected);
          if (nextConnected) {
            r.hostId = nextConnected.userId;
            nextConnected.isHost = true;
            nextConnected.isReady = true;
            this.broadcastRoomUpdate(r);
          }
        }
      }, this.gracePeriod);

      this.disconnectTimers.set(userId, timer);
    }

    this.broadcastRoomUpdate(room);
  }

  broadcastRoomUpdate(room) {
    const payload = {
      roomId: room._id,
      _id: room._id,
      code: room.code,
      name: room.name,
      gameKey: room.gameKey,
      maxPlayers: room.maxPlayers,
      hostId: room.hostId,
      status: room.status,
      players: room.players.map(p => ({
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        isReady: Boolean(p.isReady),
        isHost: p.userId === room.hostId,
        connected: p.connected !== false
      }))
    };

    this.io.to(`room_${room._id}`).emit("roomUpdate", payload);
    this.io.to(`game_${room._id}`).emit("playersUpdate", payload.players);
    this.io.to(`admin_${room._id}`).emit("playersUpdate", payload.players);
  }

  cleanupRoom(roomId) {
    const engine = this.gameEngines.get(roomId);
    if (engine) {
      engine.destroy();
      this.gameEngines.delete(roomId);
    }
    this.rooms.delete(roomId);
  }

  cleanupRooms() {
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      const activePlayers = room.players.filter(p => p.connected);
      // Empty room for > 15 minutes or abandoned for > 4 hours
      if (activePlayers.length === 0 && now - room.lastActive > 15 * 60 * 1000) {
        this.cleanupRoom(id);
      } else if (now - room.lastActive > 4 * 60 * 60 * 1000) {
        this.cleanupRoom(id);
      }
    }
  }
}

module.exports = RoomManager;
