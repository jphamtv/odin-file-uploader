const fs = require('fs').promises;
const {
  uploadFile,
  getFile,
  getAllFiles,
  deleteFile
} = require('../models/fileModel');

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await uploadFile(req.file, req.user.id);
    res.json(file);
  } catch (error) {
    console.error('Upload error', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

const handleDownload = async (req, res) => {
  try {
    const file = await getFile(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership
    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Redirect to Supabase URL
    res.redirect(file.url);
  } catch (error) {
    console.error('Download error', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

const fetchUserFiles = async (req, res) => {
  try {
    const files = await getAllFiles(req.user.id);
    res.json(files);
  } catch (error) {
    console.error('Fetching error', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

const handleDelete = async (req, res) => {
  try {
    const file = await getFile(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership
    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await deleteFile(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = {
  handleUpload,
  handleDownload,
  fetchUserFiles,
  handleDelete
}
