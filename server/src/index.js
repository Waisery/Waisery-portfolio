import app from './app.js';
import { config } from './config.js';
import { connectDatabase, disconnectDatabase } from './database.js';
import { seedContent } from './seed.js';
try {
  await connectDatabase();
  if (config.demo) { await seedContent(); console.log('LOCAL DEMO ONLY: admin@waisery.local / WaiseryDemo!2026'); }
  const server = app.listen(config.port, () => console.log(`Waisery API ready at http://localhost:${config.port}`));
  let closing = false;
  const shutdown = () => {
    if (closing) return; closing = true;
    server.close(async () => { await disconnectDatabase(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
} catch (error) { console.error(`Startup failed: ${error.message}`); await disconnectDatabase(); process.exitCode = 1; }
