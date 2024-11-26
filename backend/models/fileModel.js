// backend/models/fileModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadFile = async (fileData, userId) => {
  return prisma.file.create({
    data: {
      name: fileData.originalname,
      size: fileData.size,
      mimeType: fileData.mimetype,
      url: fileData.path,
      userId
    }
  });
};

const getFile = async (id) => {
  return prisma.file.findUnique({
    where: { id }
  });
};

const getAllFiles = async (userId) => {
  return prisma.file.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' } 
  });
};

const deleteFile = async (id) => {
  return prisma.file.delete({
    where: { id }
  });
};

module.exports = {
  uploadFile,
  getFile,
  getAllFiles,
  deleteFile,
}
