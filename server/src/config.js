import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import dns from 'node:dns';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map(value => value.trim()).filter(Boolean));
const production = process.env.NODE_ENV === 'production';
const demo = !production && !process.env.MONGODB_URI && process.env.DEMO_MODE !== 'false';
if (production && process.env.DEMO_MODE === 'true') throw new Error('Demo mode is not allowed in production.');
if (!demo && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. See server/.env.example.');
if (!demo && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET must contain at least 32 characters.');

export const config = {
  production, demo,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  origins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim()),
};
