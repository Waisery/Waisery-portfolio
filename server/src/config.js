import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import dns from 'node:dns';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map(value => value.trim()).filter(Boolean));
const production = process.env.NODE_ENV === 'production';
const demo = !production && !process.env.MONGODB_URI && process.env.DEMO_MODE !== 'false';
export function normalizeOrigin(value) {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : null;
  } catch { return null; }
}
const configuredOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(normalizeOrigin).filter(Boolean);
const siteOrigins = production ? ['https://waisery-portfolio.vercel.app'] : ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (production && process.env.DEMO_MODE === 'true') throw new Error('Demo mode is not allowed in production.');
if (!demo && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. See server/.env.example.');
if (!demo && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET must contain at least 32 characters.');

export const config = {
  production, demo,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  origins: [...new Set([...siteOrigins, ...configuredOrigins])],
};
