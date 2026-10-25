import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true, index: true },
}, { timestamps: true });
export default mongoose.model('Comment', schema);
