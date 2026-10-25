import Project from '../models/Project.js';
import { ApiError } from '../middleware/errors.js';
export async function list(req, res) {
  const projects = await Project.find().sort({ featured: -1, createdAt: -1 }).populate('user', 'username').lean();
  res.json({ projects });
}
export async function detail(req, res) {
  const project = await Project.findById(req.params.id).populate('user', 'username');
  if (!project) throw new ApiError(404, 'This project could not be found.');
  res.json({ project });
}
export async function create(req, res) { res.status(201).json({ project: await Project.create({ ...req.input, user: req.user._id }) }); }
export async function update(req, res) {
  const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.input }, { new: true, runValidators: true });
  if (!project) throw new ApiError(404, 'This project could not be found.');
  res.json({ project });
}
export async function remove(req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, 'This project could not be found.');
  res.status(204).end();
}
