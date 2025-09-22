const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one vote per user per event
voteSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);