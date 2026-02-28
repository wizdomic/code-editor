import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "./config/index.js";
import { setupSocketHandlers } from "./handlers/socketHandlers.js";
import RoomService from "./services/RoomService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createApp() {
  const app = express();
  app.use(cors(config.cors));
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: config.cors });

  setupSocketHandlers(io);

  // ─── JDoodle proxy ───────────────────────────────────────────────────────────
  app.post("/api/execute", async (req, res) => {
    try {
      const { script, language, versionIndex } = req.body;

      const response = await fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET,
          script,
          language,
          versionIndex,
        }),
      });

      const data = await response.json();
      console.log("JDoodle response:", data);
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to reach JDoodle", detail: err.message });
    }
  });
  // ─────────────────────────────────────────────────────────────────────────────

  // Clean up empty rooms every 5 minutes
  setInterval(() => {
    RoomService.cleanupEmptyRooms();
    console.log("🧹 Cleaned up empty rooms at", new Date().toISOString());
  }, 5 * 60 * 1000);

  return httpServer;
}

export default createApp;