// apna-adda-backend/index.js
try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const RoomManager = require('./roomManager');

const app = express();
app.use(express.json());

const FRONTENDS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://apnaadda1.netlify.app",
  "https://apna-adda-1.onrender.com",
  "https://apna-adda-backend.onrender.com"
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (FRONTENDS.includes(origin)) return cb(null, true);
      if (origin.endsWith(".netlify.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return cb(null, true);
      }
      return cb(null, true); // Allow all party devices
    },
    credentials: true
  })
);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const roomManager = new RoomManager(io);

const GAME_CATALOG = [
  { id: "cricketers-atlas", name: "Cricketers Atlas", minPlayers: 2, maxPlayers: 10 },
  { id: "mr-white", name: "Mr. White", minPlayers: 3, maxPlayers: 12 },
  { id: "who-am-i", name: "Who Am I?", minPlayers: 2, maxPlayers: 10 },
  { id: "spy-game", name: "Spy Game", minPlayers: 3, maxPlayers: 12 },
  { id: "dumb-charades", name: "Dumb Charades", minPlayers: 2, maxPlayers: 16 },
  { id: "hollywood-bollywood", name: "Hollywood-Bollywood", minPlayers: 2, maxPlayers: 10 },
  { id: "mafia", name: "Mafia", minPlayers: 5, maxPlayers: 16 }
];

// ---------------- REST APIS ----------------
app.post("/api/rooms", (req, res) => {
  try {
    const gameKey = req.body.gameKey || req.body.gameId;
    const hostId = req.body.hostId || req.body.hostUserId;
    const hostName = req.body.hostName || req.body.name;
    const name = req.body.name || `${hostName || "Host"}'s Adda`;
    const maxPlayers = req.body.maxPlayers;
    if (!gameKey) return res.status(400).json({ error: "gameKey required" });
    const room = roomManager.createRoom({ name, gameKey, maxPlayers, hostId, hostName });
    res.json({
      success: true,
      ok: true,
      room,
      ...room
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/rooms", (req, res) => {
  res.json(roomManager.getAllRooms());
});

app.get("/api/rooms/:id", (req, res) => {
  const room = roomManager.findRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

app.delete("/api/rooms/:id", (req, res) => {
  const room = roomManager.findRoom(req.params.id);
  if (room) {
    roomManager.cleanupRoom(room._id);
  }
  res.json({ ok: true });
});

app.get("/api/games/catalog", (req, res) => {
  res.json(GAME_CATALOG);
});

app.get("/api/games", (req, res) => {
  if (req.query.catalog === "true") {
    return res.json(GAME_CATALOG);
  }
  res.json(roomManager.getAllRooms());
});

app.get("/api/games/:id", (req, res) => {
  const room = roomManager.findRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "Game not found" });
  res.json(room);
});

app.delete("/api/games/:id", (req, res) => {
  const room = roomManager.findRoom(req.params.id);
  if (room) {
    roomManager.cleanupRoom(room._id);
  }
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    status: "ok",
    rooms: roomManager.rooms.size,
    timestamp: Date.now()
  });
});

// ---------------- SOCKET EVENTS ----------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join Room (Lobby)
  socket.on("joinRoom", ({ code, roomId, roomIdentifier, userId, name }, cb) => {
    try {
      const result = roomManager.joinRoom(socket, { code, roomId, roomIdentifier, userId, name });
      cb && cb(result);
    } catch (err) {
      console.warn("joinRoom error:", err.message);
      cb && cb({ error: err.message });
    }
  });

  // Join Game Channel
  socket.on("joinGame", ({ roomId, userId }, cb) => {
    try {
      const result = roomManager.joinGameChannel(socket, { roomId, userId });
      cb && cb(result);
    } catch (err) {
      console.warn("joinGame error:", err.message);
      cb && cb({ error: err.message });
    }
  });

  // Toggle ready status in lobby
  socket.on("toggleReady", ({ roomId, userId }, cb) => {
    try {
      const userEntry = roomManager.socketToUser.get(socket.id);
      const uid = userId || (userEntry ? userEntry.userId : null);
      const result = roomManager.toggleReady(uid, roomId);
      cb && cb(result);
    } catch (err) {
      cb && cb({ error: err.message });
    }
  });

  // Host starts the game (with strict server-side validation)
  socket.on("startRoom", ({ roomId, userId }, cb) => {
    try {
      const userEntry = roomManager.socketToUser.get(socket.id);
      const uid = userId || (userEntry ? userEntry.userId : null);
      const result = roomManager.startRoom(uid, roomId);
      cb && cb(result);
    } catch (err) {
      console.warn("startRoom validation error:", err.message);
      cb && cb({ error: err.message });
    }
  });

  // Host kicks a player
  socket.on("kickPlayer", ({ roomId, userId, targetUserId }, cb) => {
    try {
      const userEntry = roomManager.socketToUser.get(socket.id);
      const hostUid = userId || (userEntry ? userEntry.userId : null);
      const result = roomManager.kickPlayer(hostUid, { roomId, targetUserId });
      cb && cb(result);
    } catch (err) {
      cb && cb({ error: err.message });
    }
  });

  // Player leaves room
  socket.on("leaveRoom", ({ roomId, userId }, cb) => {
    try {
      const userEntry = roomManager.socketToUser.get(socket.id);
      const uid = userId || (userEntry ? userEntry.userId : null);
      roomManager.leaveRoom(socket, { roomId, userId: uid });
      cb && cb({ ok: true });
    } catch (err) {
      cb && cb({ error: err.message });
    }
  });

  // Authoritative Game Action
  socket.on("gameAction", ({ roomId, action, payload }, cb) => {
    try {
      const userEntry = roomManager.socketToUser.get(socket.id);
      const userId = userEntry ? userEntry.userId : null;
      if (!userId) return cb && cb({ error: "Unidentified socket user" });
      roomManager.handleGameAction(userId, { roomId, action, payload }, cb);
    } catch (err) {
      console.warn("gameAction error:", err.message);
      cb && cb({ error: err.message });
    }
  });

  // Disconnection handling with 60s reconnection grace period
  socket.on("disconnect", () => {
    roomManager.handleDisconnect(socket);
  });
});

if (!module.parent && process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Apna Adda Game Server running on port ${PORT}`);
  });
}

module.exports = { app, server, io, roomManager };
