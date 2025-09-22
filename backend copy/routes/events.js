const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  voteOnEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/:id/vote', protect, voteOnEvent);

module.exports = router;