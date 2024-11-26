const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const {
  uploadFile,
  getFile,
  getAllFiles,
  deleteFile
} = require('../models/fileModel');

const handleUpload = async (req, res) => {
  try {
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

    res.download(file.url, file.name);
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
    res.status(500).json({ message: 'Error fetching files ' });
  }
};

const handleDelete = async (req, res) => {
  try {
    const file = await getFile(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    await fs.unlink(file.url);

    // Delete database record
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
