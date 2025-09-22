const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Vote = require('../models/Vote');
const { validateEventData } = require('../utils/validators');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate('createdBy', 'name')
    .sort('-createdAt');
  res.json(events);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name');

  if (event) {
    // Get vote counts for each option
    const voteCounts = await Vote.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ]);

    const eventWithCounts = event.toObject();
    eventWithCounts.options = event.options.map(option => ({
      ...option.toObject(),
      voteCount: voteCounts.find(vc => vc._id.equals(option._id))?.count || 0
    }));

    res.json(eventWithCounts);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Vote on an event
// @route   POST /api/events/:id/vote
// @access  Private
const voteOnEvent = asyncHandler(async (req, res) => {
  const { optionId } = req.body;
  const eventId = req.params.id;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if option exists in event
  const optionExists = event.options.some(option => option._id.equals(optionId));
  if (!optionExists) {
    res.status(400);
    throw new Error('Invalid option');
  }

  // Check if user has already voted
  const existingVote = await Vote.findOne({
    event: eventId,
    user: req.user._id
  });

  if (existingVote) {
    res.status(400);
    throw new Error('You have already voted on this event');
  }

  // Create vote
  const vote = await Vote.create({
    event: eventId,
    user: req.user._id,
    optionId
  });

  res.status(201).json(vote);
});

module.exports = {
  getEvents,
  getEvent,
  voteOnEvent
};