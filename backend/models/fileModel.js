// backend/models/fileModel.js
const { PrismaClient } = require("@prisma/client");
const supabase = require("../config/supabaseConfig");
const prisma = new PrismaClient();

const uploadFile = async (fileData, userId, folderId = null) => {
  try {
    // Set options to force download for all file types
    const options = {
      contentType: fileData.mimeType,
      upsert: false,
      contentDisposition: `attachment; filename="${fileData.originalname}"`, // This forces download
    };

    // Upload file to Supabase
    const { data: storageData, error: storageError } = await supabase.storage
      .from("file-storage")
      .upload(
        `${userId}/${fileData.originalname}`, // Path: userId/filename
        fileData.buffer, // Raw file data
        options
      );

    if (storageError) throw storageError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("file-storage")
      .getPublicUrl(`${userId}/${fileData.originalname}`);

    // Create database record with Supabase URL
    const file = await prisma.file.create({
      data: {
        name: fileData.originalname,
        size: fileData.size,
        mimeType: fileData.mimetype,
        url: publicUrl,
        userId,
        folderId,
      },
    });

    return file;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

const getFile = async (id) => {
  return prisma.file.findUnique({
    where: { id },
  });
};

const getAllFiles = async (userId) => {
  return prisma.file.findMany({
    where: {
      userId,
      folderId: null, // Only get files that aren't in folders
    },
    orderBy: { createdAt: "desc" },
  });
};

const deleteFile = async (id) => {
  const file = await getFile(id);
  if (!file) throw new Error("File not found");

  // Delete from Supabase Storage
  const filePath = `${file.userId}/${file.name}`;
  const { error: storageError } = await supabase.storage
    .from("file-storage")
    .remove([filePath]);

  if (storageError) throw storageError;

  // Delete database record
  return prisma.file.delete({
    where: { id },
  });
};

module.exports = {
  uploadFile,
  getFile,
  getAllFiles,
  deleteFile,
};
