const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../services/password");
const { issueTokens, hashRefreshToken, verifyRefreshTokenHash } = require("../services/tokens");
const { getConfig } = require("../utils/config");
const { verifyRefreshToken } = require("../utils/jwt");

function setAuthCookies(res, tokens, config) {
  const isProd = config.nodeEnv === "production";
  res.cookie("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/api/auth/refresh",
  });
  res.cookie("access_token", tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
  });
}

async function register(req, res) {
  const { role, email, password, profile = {} } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    role,
    email: email.toLowerCase(),
    passwordHash,
    profile,
    status: "PENDING_VERIFICATION",
  });

  // Do NOT auto-activate. They must submit verification documents.
  return res.status(201).json({
    user: {
      id: String(user._id),
      role: user.role,
      status: user.status,
      email: user.email,
      profile: user.profile,
    },
    next: "/verify",
  });
}

async function login(req, res) {
  const config = getConfig();
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.status === "DELETED") return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  if (user.status === "DISABLED") return res.status(403).json({ error: "Account disabled" });

  const tokens = issueTokens(user);
  user.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
  await user.save();

  setAuthCookies(res, tokens, config);

  return res.json({
    accessToken: tokens.accessToken,
    user: { id: String(user._id), role: user.role, status: user.status, email: user.email },
  });
}

async function refresh(req, res) {
  const config = getConfig();
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Missing refresh token" });

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken, config);
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.status === "DELETED") return res.status(401).json({ error: "Invalid refresh token" });
  if (!user.refreshTokenHash) return res.status(401).json({ error: "No refresh session" });

  const ok = await verifyRefreshTokenHash(refreshToken, user.refreshTokenHash);
  if (!ok) return res.status(401).json({ error: "Invalid refresh token" });

  const tokens = issueTokens(user);
  user.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
  await user.save();

  setAuthCookies(res, tokens, config);

  return res.json({ accessToken: tokens.accessToken });
}

async function logout(req, res) {
  const userId = req.user?.sub;
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
  res.clearCookie("access_token", { path: "/" });
  return res.json({ ok: true });
}

async function me(req, res) {
  const user = await User.findById(req.user.sub).select("-passwordHash -refreshTokenHash");
  if (!user || user.status === "DELETED") return res.status(404).json({ error: "Not found" });
  return res.json({ user });
}

module.exports = { register, login, refresh, logout, me };
