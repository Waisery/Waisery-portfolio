import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  content: { type: String, required: true, maxlength: 50000 },
  excerpt: { type: String, maxlength: 400, default: '' },
  imageUrl: { type: String, default: '' },
  category: { type: String, maxlength: 60, default: 'Reflections' },
  sample: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export default mongoose.model('BlogPost', schema);
