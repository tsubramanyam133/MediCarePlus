const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  city: { type: String, required: true },
  dept: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
