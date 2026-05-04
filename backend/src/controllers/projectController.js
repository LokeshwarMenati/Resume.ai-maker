const Project = require("../models/Project");

exports.list = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch projects" });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, ...rest } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    const project = await Project.create({
      userId: req.user.id,
      title: title.trim(),
      personalDetails: rest.personalDetails,
      education: rest.education || [],
      skills: rest.skills || [],
      projects: rest.projects || [],
      experience: rest.experience || [],
      certifications: rest.certifications || [],
      uploadedResumeText: rest.uploadedResumeText || "",
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create project" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, userId: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const allowed = [
      "title",
      "personalDetails",
      "education",
      "skills",
      "projects",
      "experience",
      "certifications",
      "uploadedResumeText",
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) project[key] = req.body[key];
    });
    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update project" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete project" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch project" });
  }
};
