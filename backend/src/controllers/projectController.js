const mongoose = require("mongoose");
const Project = require("../models/Project");

const memoryProjects = new Map();

function formatProjectDoc(doc) {
  return {
    _id: doc._id || doc.id,
    id: doc._id || doc.id,
    userId: doc.userId,
    title: doc.title,
    personalDetails: doc.personalDetails || {},
    education: doc.education || [],
    skills: doc.skills || [],
    projects: doc.projects || [],
    experience: doc.experience || [],
    certifications: doc.certifications || [],
    uploadedResumeText: doc.uploadedResumeText || "",
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

exports.list = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
      return res.json(projects);
    }
    const userProjects = Array.from(memoryProjects.values()).filter((p) => p.userId === req.user.id);
    res.json(userProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch projects" });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, ...rest } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    if (mongoose.connection.readyState === 1) {
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
      return res.status(201).json(project);
    }

    const mockId = new mongoose.Types.ObjectId().toString();
    const newProj = formatProjectDoc({
      _id: mockId,
      id: mockId,
      userId: req.user.id,
      title: title.trim(),
      ...rest,
    });
    memoryProjects.set(mockId, newProj);
    res.status(201).json(newProj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create project" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOne({ _id: id, userId: req.user.id });
      if (!project) return res.status(404).json({ message: "Project not found" });

      const allowed = ["title", "personalDetails", "education", "skills", "projects", "experience", "certifications", "uploadedResumeText"];
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) project[key] = req.body[key];
      });
      await project.save();
      return res.json(project);
    }

    const existing = memoryProjects.get(id);
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: "Project not found" });

    const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
    memoryProjects.set(id, updated);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update project" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const deleted = await Project.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!deleted) return res.status(404).json({ message: "Project not found" });
      return res.json({ ok: true });
    }

    const existing = memoryProjects.get(id);
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: "Project not found" });
    memoryProjects.delete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete project" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOne({ _id: id, userId: req.user.id });
      if (!project) return res.status(404).json({ message: "Project not found" });
      return res.json(project);
    }

    const existing = memoryProjects.get(id);
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: "Project not found" });
    res.json(existing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch project" });
  }
};
