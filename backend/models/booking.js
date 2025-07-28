const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phone: String,
  carType: String,
  services: [{ name: String, price: Number }],
  plate: String,
  date: String,
  time: String
});

module.exports = mongoose.model('Booking', bookingSchema);
