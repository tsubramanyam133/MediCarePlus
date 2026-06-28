const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.single('file'), reportController.createReport);
router.get('/:phone', reportController.getReportsByPhone);

module.exports = router;
