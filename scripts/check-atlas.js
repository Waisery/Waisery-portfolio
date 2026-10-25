import dotenv from '../node_modules/dotenv/lib/main.js';
import mongoose from '../node_modules/mongoose/index.js';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../server/.env.production.local', import.meta.url)), quiet: true });
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()));
try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'waisery_portfolio', serverSelectionTimeoutMS: 15000 });
  await mongoose.connection.db.admin().ping();
  console.log('Atlas connection verified. Target database: waisery_portfolio. No data was changed.');
} catch (error) {
  const message = error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[redacted connection string]');
  console.error(`Atlas check failed: ${message}`); process.exitCode = 1;
} finally { await mongoose.disconnect(); }
