import dotenv from 'dotenv';
dotenv.config();

import { emailWorker } from './workers/emailWorker';

console.log('[Worker] Starting background workers...');

// Optional: listen for graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Worker] Gracefully shutting down...');
  await emailWorker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Worker] Gracefully shutting down...');
  await emailWorker.close();
  process.exit(0);
});
