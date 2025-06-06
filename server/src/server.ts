import { createServer } from "http";
import { config } from "./config/config";
import { connectDatabase, disconnectDatabase } from "./lib/database";
import { createApp } from "./app";
import { createSocketServer } from "./lib/socket/socketServer";

(async () => {
  try {
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO
    createSocketServer(server);

    // Start server
    server.listen(config.serverPort, () => {
      console.log(`🚀 Server running on ${config.serverURL}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log("Force shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await disconnectDatabase();
    process.exit(1);
  }
})();
