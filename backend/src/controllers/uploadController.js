const pdfParse = require("pdf-parse");
const multer = require("multer");
const Project = require("../models/Project");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }
    cb(null, true);
  },
});

exports.uploadPdf = upload.single("resume");

async function extractPdfText(buffer) {
  try {
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  } catch (e) {
    throw new Error("Could not parse PDF");
  }
}

exports.handlePdfUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "PDF file required (field: resume)" });
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId required" });

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const text = await extractPdfText(req.file.buffer);
    project.uploadedResumeText = text;
    await project.save();

    res.json({
      extractedTextPreview: text.slice(0, 2000),
      totalLength: text.length,
      project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message === "Could not parse PDF" ? err.message : "Upload failed",
    });
  }
};
