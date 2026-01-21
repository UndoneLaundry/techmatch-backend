const path = require("path");

function getConfig() {
  const port = Number(process.env.PORT || 4000);
  const nodeEnv = process.env.NODE_ENV || "development";
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  const uploadsDir = path.join(process.cwd(), "uploads");

  return {
    port,
    nodeEnv,
    clientOrigin,
    uploadsDir,
    mongoUri: process.env.MONGODB_URI,
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessTtl: process.env.JWT_ACCESS_TTL || "15m",
      refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
    },
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
      max: Number(process.env.RATE_LIMIT_MAX || 120),
    },
  };
}

module.exports = { getConfig };
