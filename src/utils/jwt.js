const jwt = require("jsonwebtoken");

function signAccessToken(payload, config) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
}

function signRefreshToken(payload, config) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
}

function verifyAccessToken(token, config) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token, config) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
