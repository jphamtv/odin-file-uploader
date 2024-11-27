// backend/routes/foldersRouter.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createNewFolder,
  fetchUserFolders,
  fetchFolder,
  fetchFolderContents,
  handleUpdate,
  handleDelete, 
  handleFolderUpload
} = require('../controllers/folderController');

// Configure Multer storage
const upload = multer({ dest: './uploads' });

// Routes for folder actions
router.post('/', createNewFolder);
router.get('/', fetchUserFolders);
router.get('/:id', fetchFolder);
router.get('/:id/contents', fetchFolderContents);
router.put('/:id', handleUpdate);
router.delete('/:id', handleDelete);

// Routes for uploading files in folders
router.post('/:id/upload', upload.single('file'), handleFolderUpload);

module.exports = router;
