const path = require("path");
const VerificationSubmission = require("../models/VerificationSubmission");
const User = require("../models/User");

/**
 * User submits onboarding verification documents.
 * Expects multipart:
 * - type: TECHNICIAN_VERIFICATION | BUSINESS_VERIFICATION | AGENCY_VERIFICATION (or inferred from role)
 * - files under fields like: identity, portfolio, supportingDocs (any)
 */
async function submitVerification(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });
  if (user.status === "ACTIVE") return res.status(400).json({ error: "Already verified" });

  const typeFromRole = {
    TECHNICIAN: "TECHNICIAN_VERIFICATION",
    BUSINESS: "BUSINESS_VERIFICATION",
    AGENCY: "AGENCY_VERIFICATION",
  };
  const type = req.body.type || typeFromRole[user.role];
  if (!type) return res.status(400).json({ error: "Missing verification type" });

  // Build document records from req.files
  const docs = [];
  const files = req.files || {};
  for (const field of Object.keys(files)) {
    for (const f of files[field]) {
      docs.push({
        field,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        fileUrl: `/uploads/verification/${path.basename(f.path)}`,
      });
    }
  }
  if (docs.length === 0) return res.status(400).json({ error: "No documents uploaded" });

  // Create new submission (keep history; don't overwrite old)
  const submission = await VerificationSubmission.create({
    userId: user._id,
    type,
    status: "PENDING",
    documents: docs,
  });

  // Ensure user is in pending state
  user.status = "PENDING_VERIFICATION";
  await user.save();

  // Notify admins
  const io = req.app.get("io");
  if (io) io.to("admins").emit("admin:newVerification", { id: String(submission._id), userId: String(user._id), type });

  return res.status(201).json({ submission });
}

async function myVerification(req, res) {
  const submissions = await VerificationSubmission.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(10);
  return res.json({ submissions });
}

module.exports = { submitVerification, myVerification };
