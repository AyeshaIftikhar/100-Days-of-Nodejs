import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  createdAt: { type: Date, default: Date.now },
  userAgent: String,
  ip: String
});

const UserAuthSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    roles: { type: [String], default: ['user'] },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    resetPasswordToken: { type: String },
    userId: { type: String } // link to user-service profile
  },
  { timestamps: true }
);

UserAuthSchema.add({ refreshTokens: [RefreshTokenSchema] });

export default mongoose.model('UserAuth', UserAuthSchema);
