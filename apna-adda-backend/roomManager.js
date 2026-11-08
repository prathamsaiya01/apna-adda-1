// apna-adda-backend/roomManager.js

const CricketersAtlasEngine = require("./games/cricketersAtlasEngine");
const MrWhiteEngine = require("./games/mrWhiteEngine");
const WhoAmIEngine = require("./games/whoAmIEngine");
const SpyGameEngine = require("./games/spyGameEngine");
const DumbCharadesEngine = require("./games/dumbCharadesEngine");
const HollywoodBollywoodEngine = require("./games/hollywoodBollywoodEngine");
const MafiaEngine = require("./games/mafiaEngine");

function normalizeGameKey(key) {
  if (!key) return "";
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("atlas") || clean.includes("cricketer")) return "CricketersAtlas";
  if (clean.includes("white")) return "MrWhite";
  if (clean.includes("whoami")) return "WhoAmI";
  if (clean.includes("spy")) return "SpyGame";
  if (clean.includes("charade")) return "DumbCharades";
  if (clean.includes("hollywood") || clean.includes("bollywood")) return "HollywoodBollywoodGame";
  if (clean.includes("mafia")) return "Mafia";
  return key;
}

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> Room
    this.socketToUser = new Map(); // socketId -> { roomId, userId }
    this.gameEngines = new Map(); // roomId -> Engine instance

    // Periodic cleanup of stale/empty rooms (rooms older than 6 hours or empty for 15 mins)
    setInterval(() => this.cleanupRooms(), 60000);
  }

  genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  genCode() {
    // Generate clean 4-character uppercase code without ambiguous chars (like O, 0, I, 1)
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
        isReady: p.isReady,
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

    let code = this.genCode();
    while (this.findRoom(code)) {
      code = this.genCode();
    }

    const _id = this.genId();
    const room = {
      _id,
      id: _id,
      code,
      name: name || `${hostName || "Host"}'s Room`,
      gameKey: normalizedKey,
      maxPlayers: Math.max(2, Math.min(20, parseInt(maxPlayers, 10) || 6)),
      hostId,
      players: [],
      status: "waiting", // 'waiting' | 'active' | 'finished'
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.rooms.set(_id, room);
    return room;
  }

  joinRoom(socket, { code, roomId, roomIdentifier, userId, name }) {
    const room = this.findRoom(code || roomId || roomIdentifier);
    if (!room) {
      throw new Error("Room not found. Please check the code.");
    }

    room.lastActive = Date.now();

    // Check if player already in room (reconnection)
    let player = room.players.find(p => p.userId === userId);
    if (player) {
      player.connected = true;
      player.socketId = socket.id;
      if (name) player.name = name;
    } else {
      if (room.players.length >= room.maxPlayers) {
        throw new Error(`Room is full (max ${room.maxPlayers} players)`);
      }
      player = {
        userId,
        name: name || `Player ${room.players.length + 1}`,
        score: 0,
        isReady: userId === room.hostId, // Host is ready by default
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

    // If game engine exists and is active, send current game state and private state
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
      room
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

    // Host migration if host left
    if (room.hostId === userId && room.players.length > 0) {
      room.hostId = room.players[0].userId;
      room.players[0].isReady = true;
    }

    this.broadcastRoomUpdate(room);
  }

  kickPlayer(hostUserId, { roomId, targetUserId }) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== hostUserId) throw new Error("Only host can remove players");
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

  startRoom(userId, roomId) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error("Room not found");
    if (room.hostId !== userId) throw new Error("Only the host can start the game");

    room.status = "active";
    room.lastActive = Date.now();

    // Normalize game key
    const normalizedKey = normalizeGameKey(room.gameKey);
    room.gameKey = normalizedKey;

    // Instantiate appropriate game engine
    let engine = null;
    switch (room.gameKey) {
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

    // Automatically join all sockets in room to game channel
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

    return { ok: true, success: true };
  }

  handleGameAction(userId, { roomId, action, payload }, callback) {
    const room = this.findRoom(roomId);
    if (!room) return callback && callback({ error: "Room not found" });

    const engine = this.gameEngines.get(room._id);
    if (!engine) return callback && callback({ error: "Game not active" });

    engine.handleAction(userId, action, payload || {}, callback);
  }

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
    }

    // If host disconnected, immediately transfer host to the next active connected player
    if (room.hostId === userId) {
      const activeConnected = room.players.find(p => p.connected && p.userId !== userId);
      if (activeConnected) {
        room.hostId = activeConnected.userId;
        activeConnected.isReady = true;
      }
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
        isReady: p.isReady,
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
