const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  deleteBooking
} = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authMiddleware');

// Routes
router.post('/bookings', authenticateToken, createBooking);
router.get('/my-bookings', authenticateToken, getMyBookings); // changed to /my-bookings
router.delete('/bookings/:id', authenticateToken, deleteBooking);

module.exports = router;
