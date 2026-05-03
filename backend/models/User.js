const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'nurse'], default: 'user' }
});

module.exports = mongoose.model('User', UserSchema);
