// backend/routes/files.js
const express = require('express');
const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.get('/', getAllFiles);
router.delete('/:id', deleteFile);

module.exports = router;
