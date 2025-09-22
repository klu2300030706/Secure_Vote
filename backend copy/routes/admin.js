const express = require('express');
const router = express.Router();
const {
  getAdminEvents,
  createEvent,
  updateEvent,
  getEventResults,
  deleteEvent,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Apply both protect and isAdmin middleware to all admin routes
router.use(protect, isAdmin);

router.get('/events', getAdminEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.get('/events/:id/results', getEventResults);
router.delete('/events/:id', deleteEvent);

module.exports = router;