const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const assistantController = require("../controllers/assistantController");
const resumeScoreController = require("../controllers/resumeScoreController");
const coverLetterController = require("../controllers/coverLetterController");

const router = Router();

router.use(requireAuth);

router.post("/assistant/chat", assistantController.chat);
router.post("/resume-score", resumeScoreController.score);
router.post("/cover-letter/generate", coverLetterController.generate);
router.post("/cover-letter/:id/enhance", coverLetterController.enhance);
router.put("/cover-letter/:id", coverLetterController.update);
router.get("/cover-letter/project/:projectId", coverLetterController.listByProject);
router.get("/cover-letter-pdf/:id", coverLetterController.downloadPdf);

module.exports = router;
