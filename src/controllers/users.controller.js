const User = require("../models/User");
const { verifyPassword, hashPassword } = require("../services/password");

async function updateMe(req, res) {
  const updates = req.body || {};
  // only allow profile updates here
  const user = await User.findById(req.user.sub);
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });

  user.profile = { ...user.profile.toObject(), ...(updates.profile || {}) };
  await user.save();

  return res.json({ user: { id: String(user._id), profile: user.profile } });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.sub);
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Current password incorrect" });

  user.passwordHash = await hashPassword(newPassword);
  // optional: revoke refresh sessions
  user.refreshTokenHash = null;
  await user.save();

  return res.json({ ok: true });
}

async function deleteMe(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });

  user.status = "DELETED";
  user.email = `deleted+${user._id}@deleted.local`; // free up email uniqueness
  user.refreshTokenHash = null;
  await user.save();

  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
  res.clearCookie("access_token", { path: "/" });

  return res.json({ ok: true });
}

module.exports = { updateMe, changePassword, deleteMe };
