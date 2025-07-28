const Booking = require('../models/booking');
const User = require('../models/User');

// POST /bookings
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { carType, services, plate, date, time } = req.body;

    const newBooking = new Booking({
      userId: user._id,
      name: user.name,
      phone: user.phone,
      carType,
      services,
      plate,
      date,
      time
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /my-bookings (protected)
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const bookings = await Booking.find({ userId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

// DELETE /bookings/:id (protected)
const deleteBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });

    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  deleteBooking
};
