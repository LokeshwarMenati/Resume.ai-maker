const mongoose = require("mongoose");

const generatedCoverLetterSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: { type: String, default: "", trim: true, maxlength: 200 },
    roleTitle: { type: String, default: "", trim: true, maxlength: 200 },
    tone: { type: String, default: "professional", enum: ["professional", "confident", "friendly"] },
    template: { type: String, default: "formal", enum: ["formal", "modern"] },
    jobDescription: { type: String, default: "" },
    generatedText: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("GeneratedCoverLetter", generatedCoverLetterSchema);
