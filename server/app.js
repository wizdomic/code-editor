import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/index.js';
import { setupSocketHandlers } from './handlers/socketHandlers.js';

const MAX_CODE_SIZE = 50 * 1024; // 50 KB

const executeLimiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  message: { error: 'Too many execution requests. Try again in a minute.' },
});

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
  app.use(cors(config.cors));
  app.use(express.json({ limit: '100kb' }));

  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: config.cors });
  setupSocketHandlers(io);

  // JDoodle execution proxy
  app.post('/api/execute', executeLimiter, async (req, res) => {
    const { script, language, versionIndex, stdin = '' } = req.body;

    if (!script || !language || !versionIndex)
      return res.status(400).json({ error: 'Missing required fields.' });

    if (Buffer.byteLength(script, 'utf8') > MAX_CODE_SIZE)
      return res.status(413).json({ error: 'Code too large (max 50 KB).' });

    try {
      const upstream = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET,
          script, language, versionIndex, stdin,
        }),
      });
      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } catch {
      res.status(500).json({ error: 'Execution service unreachable.' });
    }
  });

  return httpServer;
}

export default createApp;