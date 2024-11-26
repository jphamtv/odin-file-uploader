// backend/models/userModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUser = async (email) => {
  return prisma.user.findUnique({
    where: { email }
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
  getUser,
  createNew
}
