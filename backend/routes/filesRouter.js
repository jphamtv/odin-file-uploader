// backend/routes/filesRouter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  handleUpload,
  handleDownload,
  fetchUserFiles,
  handleDelete,
} = require("../controllers/fileController");

// Configure Multer storage into memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

router.post("/upload", upload.single("file"), handleUpload);
router.get("/:id/download", handleDownload);
router.get("/", fetchUserFiles);
router.delete("/:id", handleDelete);

module.exports = router;
