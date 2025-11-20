const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctIndex: Number,
  timeLimitSec: { type: Number, default: 15 }
});

module.exports = mongoose.model('Question', QuestionSchema);
