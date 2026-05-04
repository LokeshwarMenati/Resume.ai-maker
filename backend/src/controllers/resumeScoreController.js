const Project = require("../models/Project");
const { scoreResumePack } = require("../services/openaiAssistant");

exports.score = async (req, res) => {
  try {
    const projectId = req.body?.projectId;
    const jobDescription = typeof req.body?.jobDescription === "string" ? req.body.jobDescription.trim() : "";

    if (!projectId) return res.status(400).json({ message: "projectId is required" });

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const pack = await scoreResumePack({
      jobDescription,
      projectSnapshot: {
        title: project.title,
        personalDetails: project.personalDetails,
        skills: project.skills,
        experience: project.experience,
        education: project.education,
        projects: project.projects,
        certifications: project.certifications,
        uploadedResumeText: (project.uploadedResumeText || "").slice(0, 9000),
      },
    });

    res.json(pack);
  } catch (err) {
    console.error(err);
    const msg = typeof err.message === "string" ? err.message : "Scoring failed";
    res.status(502).json({ message: msg });
  }
};
