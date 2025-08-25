import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    name: { type: String },
    avatarUrl: { type: String },
    bio: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
