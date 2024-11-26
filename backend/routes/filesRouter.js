// backend/routes/filesRouter.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  handleUpload,
  handleDownload,
  fetchUserFiles,
  handleDelete
} = require('../controllers/fileController');

// Configure Multer storage
const upload = multer({ dest: './uploads' });

router.post('/upload', upload.single('file'), handleUpload);
router.get('/:id/download', handleDownload);
router.get('/', fetchUserFiles);
router.delete('/:id/delete', handleDelete);

module.exports = router;
