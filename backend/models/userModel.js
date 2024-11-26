// backend/models/userModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email }
  });
};

const getById = async (id) => {
  return prisma.user.findUnique({
    where: { id }
  });
};

const createNew = async (email, hashedPassword) => {
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  });
};

module.exports = {
  getByEmail,
  getById,
  createNew
}