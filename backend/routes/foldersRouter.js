// backend/routes/foldersRouter.js
const express = require('express');
const router = express.Router();
const {
  createNewFolder,
  fetchUserFolders,
  fetchFolder,
  fetchFolderContents,
  handleUpdate,
  handleDelete
} = require('../controllers/foldersController');

router.post('/', createNewFolder);
router.get('/', fetchUserFolders);
router.get('/:id', fetchFolder);
router.get('/:id/contents', fetchFolderContents);
router.put('/:id', handleUpdate);
router.delete('/:id', handleDelete);

module.exports = router;
