import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });  // always finds .env next to index.js

import createApp from './app.js';
import { config } from './config/index.js';

const server = createApp();
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});