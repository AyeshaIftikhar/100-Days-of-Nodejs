import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  commitment: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    commitment: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
export default mongoose.model<IUser>('User', UserSchema);
