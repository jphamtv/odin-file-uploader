// backend/models/folderModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNew = async (name, userId, parentId = null) => {
  return prisma.folder.create({
    data: {
      name,
      userId,
      parentId
    }
  });
};

const getAllFolders = async (userId) => {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' } 
  });
};

const getFolder = async (id) => {
  return prisma.folder.findUnique({
    where: { id }
  });
};

const getFolderContents = async (id) => {
  return prisma.folder.findUnique({
    where: { id },
    include: {
      files: true,
      children: true
    }
  });
};

const updateFolder = async (id, name) => {
  return prisma.folder.update({
    where: { id },
    data: { name },
  });
};

const deleteFolder = async (id) => {
  return prisma.folder.delete({
    where: { id }
  });
};

module.exports = {
  createNew,
  getAllFolders,
  getFolder,
  getFolderContents,
  updateFolder,
  deleteFolder,
}
