const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    field: { type: String, required: true }, // e.g. "identity", "portfolio", "supportingDocs"
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    fileUrl: { type: String, required: true },
  },
  { _id: false }
);

const VerificationSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["TECHNICIAN_VERIFICATION", "BUSINESS_VERIFICATION", "AGENCY_VERIFICATION"],
      required: true,
      index: true,
    },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    notes: { type: String, default: "" }, // admin reason
    documents: { type: [DocumentSchema], default: [] },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationSubmission", VerificationSubmissionSchema);
