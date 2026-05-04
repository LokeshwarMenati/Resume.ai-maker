const Project = require("../models/Project");
const GeneratedResume = require("../models/GeneratedResume");
const { generateResume } = require("../services/openaiResume");
const { streamResumePdf } = require("../services/resumePdf");

function projectProfilePayload(project) {
  return {
    title: project.title,
    personalDetails: project.personalDetails || {},
    education: project.education || [],
    skills: project.skills || [],
    projects: project.projects || [],
    experience: project.experience || [],
    certifications: project.certifications || [],
  };
}

exports.generate = async (req, res) => {
  try {
    const { projectId, jobDescription = "" } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId is required" });

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const profilePayload = projectProfilePayload(project);
    let generatedText;
    try {
      generatedText = await generateResume({
        profilePayload,
        uploadedResumeText: project.uploadedResumeText,
        jobDescription: String(jobDescription),
      });
    } catch (e) {
      const msg =
        typeof e.message === "string"
          ? e.message
          : "Failed to generate resume with AI";
      return res.status(502).json({ message: msg });
    }

    const doc = await GeneratedResume.create({
      projectId: project._id,
      jobDescription: String(jobDescription).trim(),
      generatedText,
      userId: req.user.id,
    });

    res.json({
      id: doc._id,
      generatedText: doc.generatedText,
      jobDescription: doc.jobDescription,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Generation failed" });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const gen = await GeneratedResume.findOne({
      _id: id,
      userId: req.user.id,
    });
    if (!gen) return res.status(404).json({ message: "Generated resume not found" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resume-${gen._id}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    streamResumePdf(gen.generatedText, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "PDF generation failed" });
  }
};

exports.listByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const owns = await Project.exists({ _id: projectId, userId: req.user.id });
    if (!owns) return res.status(404).json({ message: "Project not found" });

    const list = await GeneratedResume.find({ projectId })
      .sort({ createdAt: -1 })
      .select("-generatedText");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not list generations" });
  }
};
