import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 40 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['author', 'admin'], default: 'author' },
}, { timestamps: true });
schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.comparePassword = function (value) { return bcrypt.compare(value, this.password); };
schema.set('toJSON', { transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; } });
export default mongoose.model('User', schema);
