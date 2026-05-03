const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Report = require('./models/Report');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicareplus';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simulated OTP Store
const otpStore = new Map();

// Fast2SMS Setup (Optional)
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

// Auth Routes
app.post('/api/auth/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required' });
  
  // Generate a random 4 digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, otp);
  
  if (FAST2SMS_API_KEY) {
    try {
      // Fast2SMS API Call
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: "q",
          message: `Your MediCare+ login OTP is: ${otp}`,
          language: "english",
          flash: 0,
          numbers: phone
        })
      });

      const data = await response.json();
      
      if (data.return) {
        console.log(`[FAST2SMS SENT] OTP sent to ${phone}`);
        return res.json({ message: 'OTP sent successfully via SMS' });
      } else {
        console.error('[FAST2SMS ERROR]', data.message);
        throw new Error(data.message[0] || 'Fast2SMS failed');
      }
    } catch (error) {
      console.error('[SMS ERROR] Failed to send SMS:', error.message);
      return res.status(500).json({ message: 'Failed to send OTP via SMS. Please check your Fast2SMS balance or API key.' });
    }
  } else {
    console.error('[SMS ERROR] FAST2SMS_API_KEY is not configured in .env');
    return res.status(500).json({ message: 'SMS service is not configured on the server.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  // In Firebase architecture, if this endpoint is called, 
  // it means the frontend already verified the SMS via Google.
  const { name, phone, role } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required' });
  
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ name: name || 'User', phone, role: role || 'user' });
      await user.save();
    } else if (role && user.role !== role) {
      // If user logs in with a different role during creation/simulation
      user.role = role;
      await user.save();
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctors Routes
app.get('/api/doctors', async (req, res) => {
  try {
    const filters = {};
    if (req.query.hospital) filters.hospital = req.query.hospital;
    if (req.query.search) filters.name = { $regex: req.query.search, $options: 'i' };
    
    const doctors = await Doctor.find(filters);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/doctors/:name', async (req, res) => {
  try {
    const doctorName = decodeURIComponent(req.params.name);
    // Case insensitive regex search for exact name
    const doctor = await Doctor.findOne({ name: { $regex: new RegExp('^' + doctorName + '$', 'i') } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Appointments Route
app.post('/api/appointments', async (req, res) => {
  const { userId, doctorName, city, dept, date, slot } = req.body;
  
  try {
    const appointment = new Appointment({
      user: userId,
      doctorName,
      city,
      dept,
      date,
      slot
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports Routes
app.post('/api/reports', upload.single('file'), async (req, res) => {
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
});

app.get('/api/reports/:phone', async (req, res) => {
  try {
    const reports = await Report.find({ patientPhone: req.params.phone }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
