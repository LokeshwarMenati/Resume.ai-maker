const { Router } = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const { uploadPdf, handlePdfUpload } = require("../controllers/uploadController");

const router = Router();

router.post("/", requireAuth, (req, res, next) => {
  uploadPdf(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "File too large (max 5MB)" });
      return res.status(400).json({ message: "Upload error" });
    }
    if (err) return res.status(400).json({ message: "Only PDF files are allowed" });
    next();
  });
}, handlePdfUpload);

module.exports = router;
