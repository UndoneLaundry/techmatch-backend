require("dotenv").config();
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");

const { createApp } = require("./app");
const { createSocketServer } = require("./socket");
const { getConfig } = require("./utils/config");

async function main() {
  const config = getConfig();

  await mongoose.connect(config.mongoUri);
  console.log("[mongo] connected");

  const app = createApp(config);
  const server = http.createServer(app);

  // Socket.IO
  const io = createSocketServer(server, config);
  app.set("io", io); // make io accessible in routes via req.app.get("io")

  server.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
