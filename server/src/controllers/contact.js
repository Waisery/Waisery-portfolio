import Message from '../models/Message.js';
import { ApiError } from '../middleware/errors.js';
export async function create(req, res) { await Message.create(req.input); res.status(201).json({ message: 'Your message has been received. Thank you for reaching out.' }); }
export async function list(req, res) { res.json({ messages: await Message.find().sort({ createdAt: -1 }).lean() }); }
export async function update(req, res) {
  const message = await Message.findByIdAndUpdate(req.params.id, { $set: req.input }, { new: true, runValidators: true });
  if (!message) throw new ApiError(404, 'This message could not be found.');
  res.json({ message });
}
