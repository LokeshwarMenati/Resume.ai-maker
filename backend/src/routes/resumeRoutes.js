const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const resumeController = require("../controllers/resumeController");

const router = Router();

router.use(requireAuth);

router.post("/generate-resume", resumeController.generate);
router.get("/resume-pdf/:id", resumeController.downloadPdf);
router.get("/project/:projectId/generations", resumeController.listByProject);

module.exports = router;
