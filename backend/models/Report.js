const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  patientPhone: { type: String, required: true },
  patientName: { type: String, required: true },
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportDescription: { type: String, required: true },
  healthScore: { type: Number, required: true, default: 100 },
  attachedFileUrl: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
