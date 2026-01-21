const { verifyAccessToken } = require("../utils/jwt");
const { getConfig } = require("../utils/config");

/**
 * Auth middleware:
 * - Checks Authorization: Bearer <token> OR cookie "access_token"
 * - Attaches req.user = { sub, role }
 */
function requireAuth(req, res, next) {
  const config = getConfig();

  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearer || req.cookies.access_token;

  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const decoded = verifyAccessToken(token, config);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { requireAuth, requireRole };
