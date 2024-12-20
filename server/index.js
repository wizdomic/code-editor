import createApp from './app.js';
import { config } from './config/index.js';

const server = createApp();

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});