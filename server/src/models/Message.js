import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Message', schema);
