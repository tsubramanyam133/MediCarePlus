const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
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

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Mail Helper Function
const sendMail = async ({ to, subject, text, html, attachments }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('----------------- EMAIL MOCK LOG -----------------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    if (attachments && attachments.length > 0) {
      console.log(`Attachments: ${attachments.map(a => a.filename).join(', ')}`);
    }
    console.log('--------------------------------------------------');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments
    });
    console.log(`[EMAIL SENT] to ${to}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] failed to send to ${to}:`, err.message);
  }
};

// Simulated OTP Store
const otpStore = new Map();

// Auth Routes

// Send Register OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Generate a random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendMail({
      to: normalizedEmail,
      subject: 'MediCare+ Registration Verification OTP',
      text: `Your MediCare+ email verification OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d47a1; text-align: center;">MediCare<span style="color: #ff4081;">+</span></h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
          <p>Hello,</p>
          <p>Thank you for choosing MediCare+. Please use the verification code below to complete your registration:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; color: #ff4081; padding: 15px; background: #f8f9fa; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 0.9rem; color: #666;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'OTP sent successfully to email' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { username, email, phone, password, role, otp } = req.body;
  if (!username || !email || !phone || !password || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const storedOtpData = otpStore.get(normalizedEmail);
  
  console.log("Registering user:", { username, email, normalizedEmail, phone, otp });
  console.log("Stored OTP data:", storedOtpData);
  if (storedOtpData) {
    console.log("Check matches:", { otpMatch: storedOtpData.otp === otp, isExpired: storedOtpData.expiresAt < Date.now(), expiresAt: new Date(storedOtpData.expiresAt).toLocaleTimeString(), now: new Date().toLocaleTimeString() });
  }

  if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP from store
  otpStore.delete(normalizedEmail);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username, Email, or Phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      name: username, // compatibility mapping
      email,
      phone,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Send Forgot Password OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate a random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendMail({
      to: normalizedEmail,
      subject: 'MediCare+ Password Reset OTP',
      text: `Your MediCare+ password reset OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d47a1; text-align: center;">MediCare<span style="color: #ff4081;">+</span></h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
          <p>Hello,</p>
          <p>We received a request to reset your MediCare+ password. Please use the verification code below to complete the reset process:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; color: #ff4081; padding: 15px; background: #f8f9fa; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 0.9rem; color: #666;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'OTP sent successfully to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send verification OTP' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const storedOtpData = otpStore.get(normalizedEmail);

  console.log("Resetting password for:", { email, normalizedEmail, otp });
  console.log("Stored OTP data:", storedOtpData);

  if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP from store
  otpStore.delete(normalizedEmail);

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
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
    const doctor = await Doctor.findOne({ name: { $regex: new RegExp('^' + doctorName + '$', 'i') } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Appointments Route with PDF attachment and confirmation email
app.post('/api/appointments', upload.single('file'), async (req, res) => {
  const { userId, doctorName, city, dept, date, slot } = req.body;
  const attachedFileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!userId || !doctorName || !city || !dept || !date || !slot) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const appointment = new Appointment({
      user: userId,
      doctorName,
      city,
      dept,
      date,
      slot,
      attachedFileUrl
    });
    await appointment.save();

    // Look up the patient user
    const user = await User.findById(userId);
    if (user && user.email) {
      const attachments = [];
      if (req.file) {
        attachments.push({
          filename: req.file.originalname,
          path: req.file.path
        });
      }

      await sendMail({
        to: user.email,
        subject: 'Appointment Confirmed - MediCare+',
        text: `Hello ${user.username},\n\nYour appointment has been successfully booked!\n\nDetails:\n- Doctor: ${doctorName}\n- Hospital/City: ${city}\n- Department: ${dept}\n- Date: ${date}\n- Slot: ${slot}\n\nThank you for choosing MediCare+.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d47a1; text-align: center;">MediCare<span style="color: #ff4081;">+</span></h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
            <h3 style="color: #2e7d32; text-align: center;">✔️ Appointment Confirmed</h3>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>You have successfully scheduled an appointment with us. Please review the details below:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Doctor</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Hospital / City</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${city}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Department</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${dept}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Date</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${date}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Time Slot</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${slot}</td>
              </tr>
            </table>
            <p style="font-size: 0.9rem; color: #666; text-align: center; margin-top: 30px;">Thank you for choosing MediCare+.</p>
          </div>
        `,
        attachments
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Appointment booking error:', error);
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

