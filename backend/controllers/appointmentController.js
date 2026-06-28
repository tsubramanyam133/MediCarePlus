const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');

exports.bookAppointment = async (req, res) => {
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
};
