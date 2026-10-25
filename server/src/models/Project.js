import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 12000 },
  imageUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'audio', 'text'], default: 'image' },
  mediaUrl: { type: String, default: '' },
  content: { type: String, default: '', maxlength: 50000 },
  contentNote: { type: String, default: '', maxlength: 400 },
  sourceKey: { type: String, unique: true, sparse: true },
  repoUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  category: { type: String, default: 'Digital experience', maxlength: 60 },
  tags: [{ type: String, maxlength: 30 }],
  featured: { type: Boolean, default: false },
  sample: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export default mongoose.model('Project', schema);
