const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. 6-digit code
    name: { type: String, required: true },               // room name
    gameKey: { type: String, required: true },            // "cricketers-atlas", "quiz", etc.
    maxPlayers: { type: Number, default: 4 },
    hostId: { type: String, required: true },             // user id of creator
    status: {
      type: String,
      enum: ["waiting", "active", "finished"],
      default: "waiting",
    },
    players: [
      {
        userId: String,
        name: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
