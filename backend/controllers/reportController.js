const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  const { patientPhone, patientName, nurseId, reportDescription, healthScore } = req.body;
  const attachedFileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const report = new Report({ 
      patientPhone, 
      patientName,
      nurseId, 
      reportDescription, 
      healthScore,
      attachedFileUrl
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportsByPhone = async (req, res) => {
  try {
    const rawPhone = req.params.phone || '';
    const last10Digits = rawPhone.replace(/[^0-9]/g, '').slice(-10);
    
    // Match any phone that ends with these 10 digits
    const phoneRegex = new RegExp(last10Digits + '$');
    
    const reports = await Report.find({ patientPhone: { $regex: phoneRegex } }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
