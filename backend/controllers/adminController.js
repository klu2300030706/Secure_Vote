const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Vote = require('../models/Vote');
const { validateEventData } = require('../utils/validators');

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Private/Admin
const getAdminEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate('createdBy', 'name email')
    .sort('-createdAt');
  res.json(events);
});

// @desc    Create new event
// @route   POST /api/admin/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, options, startAt, endAt } = req.body;

  // Validate event data
  const errors = validateEventData({ title, description, options, startAt, endAt });
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const event = await Event.create({
    title,
    description,
    options: options.map(opt => ({ name: opt })),
    createdBy: req.user._id,
    startAt,
    endAt
  });

  res.status(201).json(event);
});

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if voting has started
  const hasVotes = await Vote.exists({ event: event._id });
  if (hasVotes && req.body.options) {
    res.status(400);
    throw new Error('Cannot modify options after voting has started');
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedEvent);
});

// @desc    Get event results
// @route   GET /api/admin/events/:id/results
// @access  Private/Admin
const getEventResults = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Get vote counts and voters for each option
  const results = await Vote.aggregate([
    { $match: { event: event._id } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'voter'
      }
    },
    {
      $group: {
        _id: '$optionId',
        count: { $sum: 1 },
        voters: {
          $push: {
            _id: { $arrayElemAt: ['$voter._id', 0] },
            name: { $arrayElemAt: ['$voter.name', 0] },
            email: { $arrayElemAt: ['$voter.email', 0] }
          }
        }
      }
    }
  ]);

  // Format results with option names
  const formattedResults = event.options.map(option => ({
    option: option.name,
    optionId: option._id,
    ...results.find(r => r._id.equals(option._id)) || { count: 0, voters: [] }
  }));

  res.json({
    event: {
      _id: event._id,
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt
    },
    results: formattedResults
  });
});

// @desc    Delete an event created by the requesting admin
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Only the creator admin can delete their event
  if (!event.createdBy.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  // Delete associated votes first to avoid orphans
  await Vote.deleteMany({ event: event._id });
  await event.deleteOne();

  res.json({ message: 'Event deleted successfully' });
});

module.exports = {
  getAdminEvents,
  createEvent,
  updateEvent,
  getEventResults,
  deleteEvent
};