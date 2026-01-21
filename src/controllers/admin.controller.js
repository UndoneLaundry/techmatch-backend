const VerificationSubmission = require("../models/VerificationSubmission");
const SkillSubmission = require("../models/SkillSubmission");
const User = require("../models/User");

async function listVerifications(req, res) {
  const status = req.query.status || "PENDING";
  const items = await VerificationSubmission.find({ status })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("userId", "email role status profile");
  return res.json({ items });
}

async function approveVerification(req, res) {
  const submission = await VerificationSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: "Not found" });
  if (submission.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  submission.status = "APPROVED";
  submission.decidedAt = new Date();
  submission.decidedBy = req.user.sub;
  submission.notes = req.body?.notes || "";
  await submission.save();

  const user = await User.findById(submission.userId);
  if (user && user.status !== "DELETED") {
    user.status = "ACTIVE";
    await user.save();
  }

  const io = req.app.get("io");
  if (io) {
    io.to("admins").emit("admin:verificationDecided", { id: String(submission._id), status: submission.status });
    io.to(`user:${submission.userId}`).emit("verification:statusChanged", { status: "ACTIVE" });
  }

  return res.json({ submission });
}

async function rejectVerification(req, res) {
  const submission = await VerificationSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: "Not found" });
  if (submission.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  submission.status = "REJECTED";
  submission.decidedAt = new Date();
  submission.decidedBy = req.user.sub;
  submission.notes = req.body?.notes || "Rejected";
  await submission.save();

  const user = await User.findById(submission.userId);
  if (user && user.status !== "DELETED") {
    user.status = "REJECTED";
    await user.save();
  }

  const io = req.app.get("io");
  if (io) {
    io.to("admins").emit("admin:verificationDecided", { id: String(submission._id), status: submission.status });
    io.to(`user:${submission.userId}`).emit("verification:statusChanged", { status: "REJECTED", notes: submission.notes });
  }

  return res.json({ submission });
}

async function listSkillSubmissions(req, res) {
  const status = req.query.status || "PENDING";
  const items = await SkillSubmission.find({ status })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("userId", "email role status profile");
  return res.json({ items });
}

async function approveSkillSubmission(req, res) {
  const submission = await SkillSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: "Not found" });
  if (submission.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  submission.status = "APPROVED";
  submission.decidedAt = new Date();
  submission.decidedBy = req.user.sub;
  submission.notes = req.body?.notes || "";
  await submission.save();

  const user = await User.findById(submission.userId);
  if (user && user.role === "TECHNICIAN" && user.status === "ACTIVE") {
    // merge or add
    const existing = user.skills.find((s) => s.name.toLowerCase() === submission.skillName.toLowerCase());
    const approvedCerts = (submission.certifications || []).map((c) => ({
      title: c.title,
      fileUrl: c.fileUrl,
      approvedAt: new Date(),
    }));

    if (existing) {
      existing.certifications.push(...approvedCerts);
    } else {
      user.skills.push({
        name: submission.skillName,
        certifications: approvedCerts,
        approvedAt: new Date(),
      });
    }
    await user.save();
  }

  const io = req.app.get("io");
  if (io) {
    io.to("admins").emit("admin:skillDecided", { id: String(submission._id), status: submission.status });
    io.to(`user:${submission.userId}`).emit("skill:statusChanged", { id: String(submission._id), status: "APPROVED" });
  }

  return res.json({ submission });
}

async function rejectSkillSubmission(req, res) {
  const submission = await SkillSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ error: "Not found" });
  if (submission.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  submission.status = "REJECTED";
  submission.decidedAt = new Date();
  submission.decidedBy = req.user.sub;
  submission.notes = req.body?.notes || "Rejected";
  await submission.save();

  const io = req.app.get("io");
  if (io) {
    io.to("admins").emit("admin:skillDecided", { id: String(submission._id), status: submission.status });
    io.to(`user:${submission.userId}`).emit("skill:statusChanged", { id: String(submission._id), status: "REJECTED", notes: submission.notes });
  }

  return res.json({ submission });
}

module.exports = {
  listVerifications,
  approveVerification,
  rejectVerification,
  listSkillSubmissions,
  approveSkillSubmission,
  rejectSkillSubmission,
};
