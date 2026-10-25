import mongoose from 'mongoose';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
let local;
export async function connectDatabase() {
  let uri = config.mongoUri;
  if (config.demo) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const data = fileURLToPath(new URL('../.data/mongodb', import.meta.url));
    const binaries = fileURLToPath(new URL('../.data/binaries', import.meta.url));
    await mkdir(data, { recursive: true }); await mkdir(binaries, { recursive: true });
    local = await MongoMemoryServer.create({ binary: { downloadDir: binaries }, instance: { dbPath: data, storageEngine: 'wiredTiger', dbName: 'waisery' } });
    uri = local.getUri();
    console.log('Local demo MongoDB started. Data is stored in server/.data/mongodb.');
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'waisery', serverSelectionTimeoutMS: 15000 });
  await Promise.all(Object.values(mongoose.models).map(m => m.init()));
}
export async function disconnectDatabase() { await mongoose.disconnect(); if (local) await local.stop({ doCleanup: false }); }
