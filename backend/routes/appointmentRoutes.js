const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const multer = require('multer');

// Re-setup multer specifically for appointments or use shared
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.single('file'), appointmentController.bookAppointment);

module.exports = router;
