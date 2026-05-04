const Project = require("../models/Project");
const { coachChat } = require("../services/openaiAssistant");

exports.chat = async (req, res) => {
  try {
    const raw = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const projectId = req.body?.projectId || "";

    if (!raw) return res.status(400).json({ message: "message is required" });
    if (raw.length > 4000) return res.status(400).json({ message: "Message too long (max ~4000 chars)" });

    let profileHint = "";

    if (projectId) {
      const project = await Project.findOne({ _id: projectId, userId: req.user.id });
      if (!project) return res.status(404).json({ message: "Project not found" });

      const payload = {
        title: project.title,
        personalDetails: project.personalDetails,
        skills: project.skills,
        experience: project.experience,
        education: project.education,
        projects: project.projects,
        certifications: project.certifications,
        uploadedResumeText: (project.uploadedResumeText || "").slice(0, 9000),
      };
      profileHint = JSON.stringify(payload, null, 2);
    }

    const reply = await coachChat({ userMessage: raw, profileJsonHint: profileHint });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    const msg = typeof err.message === "string" ? err.message : "Assistant unavailable";
    res.status(502).json({ message: msg });
  }
};
