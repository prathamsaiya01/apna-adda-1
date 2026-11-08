const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  userId: String,
  name: String,
  socketId: String,
  score: { type: Number, default: 0 },
  answeredCurrent: { type: Boolean, default: false }
});

const GameSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  hostId: String,
  status: { type: String, default: 'waiting' },
  players: [PlayerSchema],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  currentQuestionIndex: { type: Number, default: -1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
