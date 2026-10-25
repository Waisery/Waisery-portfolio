import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';
import { ApiError } from './errors.js';

export const publicUser = u => ({ _id: String(u._id), username: u.username, email: u.email, role: u.role });
export function issueSession(user) {
  return { user: publicUser(user), token: jwt.sign({}, config.jwtSecret, { subject: String(user._id), expiresIn: '8h', algorithm: 'HS256', issuer: 'waisery-api', audience: 'waisery-client' }) };
}
export async function protect(req, _res, next) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Please sign in to continue.');
  let payload;
  try { payload = jwt.verify(header.slice(7), config.jwtSecret, { algorithms: ['HS256'], issuer: 'waisery-api', audience: 'waisery-client' }); }
  catch { throw new ApiError(401, 'Your session has expired. Please sign in again.'); }
  req.user = await User.findById(payload.sub);
  if (!req.user) throw new ApiError(401, 'Your account is no longer available.');
  next();
}
export function adminOnly(req, _res, next) {
  if (req.user.role !== 'admin') throw new ApiError(403, 'Administrator access is required.');
  next();
}
