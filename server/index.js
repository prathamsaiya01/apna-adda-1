require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// MODELS
const Room = require("./models/Room");
const Question = require('./models/Question');
const Game = require('./models/Game');

// EXPRESS APP
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// CONNECT MONGODB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo error:", err));

/* -----------------------------
   REST APIs
--------------------------------*/

// Create Question (Quiz)
app.post('/api/questions', async (req, res) => {
  const q = await Question.create(req.body);
  res.json(q);
});

// Generate 6-character room code
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create Room
app.post("/api/rooms", async (req, res) => {
  try {
    const { name, gameKey, maxPlayers, hostId } = req.body;

    if (!name || !gameKey || !hostId) {
      return res.status(400).json({ error: "name, gameKey, hostId required" });
    }

    let code;
    while (true) {
      code = generateRoomCode();
      const exists = await Room.findOne({ code });
      if (!exists) break;
    }

    const room = await Room.create({
      name,
      gameKey,
      maxPlayers: maxPlayers || 4,
      hostId,
      code,
    });

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Room by Code
app.get("/api/rooms/code/:code", async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Rooms (for debug or listing active games)
app.get("/api/rooms", async (req, res) => {
  try {
    const { gameKey } = req.query;
    const filter = gameKey ? { gameKey } : {};
    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// QUIZ: Create game
app.post('/api/games', async (req, res) => {
  const { hostId, questionIds } = req.body;
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const game = await Game.create({ code, hostId, questions: questionIds });
  res.json(game);
});

/* -----------------------------
   SOCKET.IO
--------------------------------*/

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* -----------------------------
        JOIN ROOM
  ------------------------------*/

  socket.on("joinRoom", async ({ code, userId, name }, cb) => {
    try {
      const room = await Room.findOne({ code: code.toUpperCase() });
      if (!room) return cb({ error: "Room not found" });

      const already = room.players.find((p) => p.userId === userId);

      if (!already) {
        if (room.players.length >= room.maxPlayers) {
          return cb({ error: "Room is full" });
        }
        room.players.push({ userId, name });
        await room.save();
      }

      const roomId = room._id.toString();
      socket.join(roomId);

      io.to(roomId).emit("roomUpdate", {
        roomId,
        code: room.code,
        name: room.name,
        gameKey: room.gameKey,
        maxPlayers: room.maxPlayers,
        players: room.players,
        status: room.status,
      });

      cb({ ok: true, roomId, code: room.code });
    } catch (err) {
      cb({ error: "Server error" });
    }
  });

  /* -----------------------------
        START ROOM (HOST)
  ------------------------------*/

  socket.on("startRoom", async ({ roomId }, cb) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return cb({ error: "Room not found" });

      if (room.status === "active") {
        return cb({ error: "Room already started" });
      }

      if (room.players.length < 2) {
        return cb({ error: "Need at least 2 players to start" });
      }

      room.status = "active";
      await room.save();

      io.to(roomId).emit("roomStarted", {
        roomId,
        gameKey: room.gameKey,
        code: room.code,
      });

      cb({ ok: true });
    } catch (err) {
      cb({ error: "Server error" });
    }
  });

  /* -----------------------------
        QUIZ joinGame
  ------------------------------*/

  socket.on("joinGame", async ({ code, userId, name }, cb) => {
    try {
      const game = await Game.findOne({ code });
      if (!game) return cb({ error: "Game not found" });

      let player = game.players.find((p) => p.userId === userId);

      if (!player) {
        game.players.push({ userId, name, socketId: socket.id });
      } else {
        player.socketId = socket.id;
      }

      await game.save();
      socket.join(game._id.toString());

      io.to(game._id.toString()).emit("playersUpdate", game.players);

      cb({ ok: true, gameId: game._id.toString() });
    } catch (err) {
      cb({ error: "Server error" });
    }
  });
});

server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));