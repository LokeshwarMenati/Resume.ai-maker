const Project = require("../models/Project");
const GeneratedCoverLetter = require("../models/GeneratedCoverLetter");
const { generateCoverLetter, improveCoverLetter } = require("../services/openaiAssistant");
const { streamCoverLetterPdf } = require("../services/coverLetterPdf");

function normalizeTone(tone) {
  const x = String(tone || "").trim().toLowerCase();
  if (x === "professional" || x === "confident" || x === "friendly") return x;
  return "professional";
}

function normalizeTemplate(template) {
  const x = String(template || "").trim().toLowerCase();
  if (x === "formal" || x === "modern") return x;
  return "formal";
}

function projectSnapshot(project) {
  return {
    title: project.title,
    personalDetails: project.personalDetails || {},
    skills: project.skills || [],
    experience: project.experience || [],
    education: project.education || [],
    projects: project.projects || [],
    certifications: project.certifications || [],
    uploadedResumeText: (project.uploadedResumeText || "").slice(0, 9000),
  };
}

exports.generate = async (req, res) => {
  try {
    const projectId = String(req.body?.projectId || "").trim();
    const companyName = String(req.body?.companyName || "").trim();
    const roleTitle = String(req.body?.roleTitle || "").trim();
    const jobDescription = String(req.body?.jobDescription || "").trim();
    const tone = normalizeTone(req.body?.tone);
    const template = normalizeTemplate(req.body?.template);

    if (!projectId) return res.status(400).json({ message: "projectId is required" });
    if (!companyName) return res.status(400).json({ message: "companyName is required" });
    if (!jobDescription) return res.status(400).json({ message: "jobDescription is required" });

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const generatedText = await generateCoverLetter({
      profileSnapshot: projectSnapshot(project),
      jobDescription,
      companyName,
      roleTitle,
      tone,
      template,
    });

    const doc = await GeneratedCoverLetter.create({
      projectId: project._id,
      userId: req.user.id,
      companyName,
      roleTitle,
      tone,
      template,
      jobDescription,
      generatedText,
    });

    res.json(doc);
  } catch (err) {
    console.error(err);
    const msg = typeof err.message === "string" ? err.message : "Cover letter generation failed";
    res.status(502).json({ message: msg });
  }
};

exports.enhance = async (req, res) => {
  try {
    const { id } = req.params;
    const action = String(req.body?.action || "strengthen").trim().toLowerCase();
    const doc = await GeneratedCoverLetter.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Cover letter not found" });

    const next = await improveCoverLetter({
      currentText: doc.generatedText,
      action,
      tone: doc.tone,
      companyName: doc.companyName,
      roleTitle: doc.roleTitle,
      jobDescription: doc.jobDescription,
    });

    doc.generatedText = next;
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    const msg = typeof err.message === "string" ? err.message : "Could not improve cover letter";
    res.status(502).json({ message: msg });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const text = String(req.body?.generatedText || "").trim();
    if (!text) return res.status(400).json({ message: "generatedText is required" });
    const doc = await GeneratedCoverLetter.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Cover letter not found" });
    doc.generatedText = text;
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save cover letter edits" });
  }
};

exports.listByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const owns = await Project.exists({ _id: projectId, userId: req.user.id });
    if (!owns) return res.status(404).json({ message: "Project not found" });
    const list = await GeneratedCoverLetter.find({ projectId }).sort({ updatedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not list cover letters" });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await GeneratedCoverLetter.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Cover letter not found" });
    const project = await Project.findOne({ _id: doc.projectId, userId: req.user.id });

    res.setHeader("Content-Disposition", `attachment; filename="cover-letter-${doc._id}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    streamCoverLetterPdf(
      {
        text: doc.generatedText,
        personalDetails: project?.personalDetails || {},
      },
      res
    );
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "Could not create PDF" });
  }
};
