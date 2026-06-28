const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendMail = require('../utils/sendMail');

// Send Register OTP
exports.sendRegisterOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB, using upsert to replace any existing unverified OTP for this email
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
};

// Register User
exports.register = async (req, res) => {
  const { username, email, phone, password, role, otp } = req.body;
  if (!username || !email || !phone || !password || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    const storedOtp = await Otp.findOne({ email: normalizedEmail });

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP from DB
    await Otp.deleteOne({ email: normalizedEmail });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email: normalizedEmail }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username, Email, or Phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      name: username,
      email: normalizedEmail,
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
};

// Login User
exports.login = async (req, res) => {
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
};

// Send Forgot Password OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const storedOtp = await Otp.findOne({ email: normalizedEmail });

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteOne({ email: normalizedEmail });

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
};
