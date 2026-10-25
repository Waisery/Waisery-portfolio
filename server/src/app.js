import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import router from './routes/index.js';
import { config } from './config.js';
import { ApiError, errorHandler } from './middleware/errors.js';
import { profile } from './profile.js';

const app = express();
app.disable('x-powered-by');
if (config.production) app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: { imgSrc: ["'self'", 'https:', 'data:'], connectSrc: ["'self'"] } } }));
app.use(cors({ origin(origin, callback) { callback(null, !origin || config.origins.includes(origin)); } }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable', mode: config.demo ? 'demo' : 'production', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.get('/api/profile', (_req, res) => res.json({ profile, demo: config.demo }));
app.use('/api', router);
app.use('/api', (_req, _res, next) => next(new ApiError(404, 'This API endpoint does not exist.')));
const clientPath = fileURLToPath(new URL('../../client/dist/', import.meta.url));
if (existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('/{*path}', (req, res, next) => { if (req.path.includes('.')) return next(); res.sendFile(`${clientPath}/index.html`); });
}
app.use((_req, _res, next) => next(new ApiError(404, 'This page could not be found.')));
app.use(errorHandler);
export default app;
