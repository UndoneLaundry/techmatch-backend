const mongoose = require("mongoose");

const SkillSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    skillName: { type: String, required: true, index: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    notes: { type: String, default: "" },
    certifications: {
      type: [
        {
          title: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          fileUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillSubmission", SkillSubmissionSchema);
