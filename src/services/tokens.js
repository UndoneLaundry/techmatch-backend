const bcrypt = require("bcryptjs");
const { getConfig } = require("../utils/config");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");

function buildJwtPayload(user) {
  return { sub: String(user._id), role: user.role };
}

function issueTokens(user) {
  const config = getConfig();
  const payload = buildJwtPayload(user);
  const accessToken = signAccessToken(payload, config);
  const refreshToken = signRefreshToken(payload, config);
  return { accessToken, refreshToken };
}

async function hashRefreshToken(refreshToken) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(refreshToken, salt);
}

async function verifyRefreshTokenHash(refreshToken, hash) {
  return bcrypt.compare(refreshToken, hash);
}

module.exports = { issueTokens, hashRefreshToken, verifyRefreshTokenHash, buildJwtPayload };
