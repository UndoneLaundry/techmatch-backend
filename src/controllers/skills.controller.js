const path = require("path");
const SkillSubmission = require("../models/SkillSubmission");
const User = require("../models/User");

function normalizeTitles(input, fileCount) {
  // certTitles can be JSON string of array, or comma separated, or array already
  if (!input) return Array.from({ length: fileCount }, (_, i) => `Certification ${i + 1}`);
  let titles = input;
  if (typeof titles === "string") {
    try {
      titles = JSON.parse(titles);
    } catch {
      titles = titles.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(titles)) titles = [];
  while (titles.length < fileCount) titles.push(`Certification ${titles.length + 1}`);
  return titles.slice(0, fileCount);
}

async function submitSkill(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });
  if (user.role !== "TECHNICIAN") return res.status(403).json({ error: "Only technicians can submit skills" });
  if (user.status !== "ACTIVE") return res.status(403).json({ error: "Account not active" });

  // enforce max 3 pending submissions (as your proposal suggests)
  const pendingCount = await SkillSubmission.countDocuments({ userId: user._id, status: "PENDING" });
  if (pendingCount >= 3) return res.status(400).json({ error: "Max 3 pending skills at a time" });

  const { skillName } = req.body;

  const files = (req.files && req.files.certifications) ? req.files.certifications : [];
  const titles = normalizeTitles(req.body.certTitles, files.length);

  const certs = files.map((f, idx) => ({
    title: titles[idx],
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    fileUrl: `/uploads/skills/${path.basename(f.path)}`,
  }));

  const submission = await SkillSubmission.create({
    userId: user._id,
    skillName,
    certifications: certs,
    status: "PENDING",
  });

  const io = req.app.get("io");
  if (io) io.to("admins").emit("admin:newSkillSubmission", { id: String(submission._id), userId: String(user._id), skillName });

  return res.status(201).json({ submission });
}

async function mySkillSubmissions(req, res) {
  const subs = await SkillSubmission.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(50);
  return res.json({ submissions: subs });
}

module.exports = { submitSkill, mySkillSubmissions };
