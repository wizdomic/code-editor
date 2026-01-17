import express from "express";
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
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: config.cors });

  setupSocketHandlers(io);

  //clean up empty rooms every 5 mintues (garbage collection / free up memory)
  setInterval(() => {
    RoomService.cleanupEmptyRooms();
    console.log("🧹 Cleaned up empty rooms at", new Date().toISOString());
  }, 1 * 60 * 1000);

  return httpServer;
}

export default createApp;
