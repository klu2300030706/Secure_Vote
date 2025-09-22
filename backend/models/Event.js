const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  options: [{
    name: {
      type: String,
      required: [true, 'Please add an option name']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startAt: {
    type: Date,
    default: Date.now
  },
  endAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);