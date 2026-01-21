const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    approvedAt: { type: Date, default: null },
  },
  { _id: false }
);

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["APPROVED"], default: "APPROVED" },
    certifications: { type: [CertificationSchema], default: [] },
    approvedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["TECHNICIAN", "BUSINESS", "AGENCY", "ADMIN"], required: true },
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "ACTIVE", "REJECTED", "DISABLED", "DELETED"],
      default: "PENDING_VERIFICATION",
      index: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },

    profile: {
      // common
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },

      // business fields
      businessName: { type: String, default: "" },
      contactPerson: { type: String, default: "" },
      address: { type: String, default: "" },
      uen: { type: String, default: "" },

      // agency fields (optional)
      agencyName: { type: String, default: "" },
    },

    // technician-specific
    skills: { type: [SkillSchema], default: [] },

    // refresh token rotation
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
