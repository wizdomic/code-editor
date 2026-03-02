import { createApp } from './app.js';
import { config } from './config/index.js';

// ── Validate required env vars before starting ────────────────────────────────
// Fail fast: better to crash at startup than silently fail at runtime.
const REQUIRED_ENV = ['JDOODLE_CLIENT_ID', 'JDOODLE_CLIENT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const server = createApp();

server.listen(config.port, () => {
  console.log(`[SERVER] Running on port ${config.port}`);
  console.log(`[SERVER] Allowed origins: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown — finish in-flight requests before exiting
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});