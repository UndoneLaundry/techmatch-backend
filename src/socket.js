const { Server } = require("socket.io");
const { getConfig } = require("./utils/config");
const { verifyAccessToken } = require("./utils/jwt");

/**
 * Socket auth:
 * - client connects with io(url, { auth: { token } })
 * - token is access token
 */
function createSocketServer(httpServer, config) {
  const io = new Server(httpServer, {
    cors: { origin: config.clientOrigin, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));
      const decoded = verifyAccessToken(token, config);
      socket.user = decoded;
      return next();
    } catch (e) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { sub, role } = socket.user;
    socket.join(`user:${sub}`);
    if (role === "ADMIN") socket.join("admins");

    socket.on("disconnect", () => {});
  });

  return io;
}

module.exports = { createSocketServer };
