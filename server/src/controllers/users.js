import User from '../models/User.js';
import { ApiError } from '../middleware/errors.js';
import { issueSession, publicUser } from '../middleware/auth.js';
export async function register(req, res) {
  const user = await User.create(req.input);
  res.status(201).json(issueSession(user));
}
export async function login(req, res) {
  const user = await User.findOne({ email: req.input.email }).select('+password');
  if (!user || !(await user.comparePassword(req.input.password))) throw new ApiError(401, 'Email or password is incorrect.');
  res.json(issueSession(user));
}
export function me(req, res) { res.json({ user: publicUser(req.user) }); }
