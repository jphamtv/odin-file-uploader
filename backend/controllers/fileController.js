const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;

const uploadFile = async (req, res) => {
  try {
    // req.file contains info about uploaded file
    // Save metadata to database
    const fileData = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: req.file.path,
        userId: req.user.id
      }
    });

    res.json(fileData);
    console.log(req.file, req.body)
  } catch (error) {
    console.error('Upload error', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id }
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(file.url, file.name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files ' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id }
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    await fs.unlink(file.url);

    // Delete database record
    await prisma.file.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  getAllFiles,
  deleteFile
}
