const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async ({ to, subject, text, html, attachments }) => {
  // If Google Apps Script Web App URL is provided, send via HTTPS POST (bypasses Render SMTP port block)
  if (process.env.GMAIL_SCRIPT_URL) {
    try {
      const response = await fetch(process.env.GMAIL_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body: text, html })
      });
      
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          console.log(`[EMAIL SENT VIA APPS SCRIPT] to ${to}`);
          return;
        } else {
          console.error(`[APPS SCRIPT EMAIL ERROR] to ${to}:`, data.error);
        }
      } else {
        const responseText = await response.text();
        console.error(`[APPS SCRIPT EMAIL ERROR] expected JSON, received: ${contentType}. Body: ${responseText.substring(0, 250)}`);
      }
    } catch (err) {
      console.error(`[APPS SCRIPT FETCH ERROR] failed to send to ${to}:`, err.message);
    }
  }

  // Fallback to SMTP
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

module.exports = sendMail;
