const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dept: { type: String, required: true },
  hospital: { type: String, required: true },
  experience: { type: String, required: true },
  slots: [{ type: String }],
  img: { type: String },
  bio: { type: String }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
