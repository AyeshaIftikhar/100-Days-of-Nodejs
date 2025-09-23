import mongoose, { Document, Schema } from 'mongoose';

export interface IServer extends Document {
  _id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  environment: 'development' | 'staging' | 'production';
  type: 'physical' | 'virtual' | 'container' | 'kubernetes';
  os: string;
  location: string;
  tags: string[];
  isActive: boolean;
  lastSeen?: Date;
  metadata: {
    cluster?: string;
    namespace?: string;
    nodeSelector?: Record<string, string>;
    labels?: Record<string, string>;
  };
  credentials?: {
    sshKey?: string;
    username?: string;
    port?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  hostname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  ipAddress: {
    type: String,
    required: true,
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Please enter a valid IP address'],
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    required: true,
  },
  type: {
    type: String,
    enum: ['physical', 'virtual', 'container', 'kubernetes'],
    required: true,
  },
  os: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
  },
  metadata: {
    cluster: String,
    namespace: String,
    nodeSelector: {
      type: Map,
      of: String,
    },
    labels: {
      type: Map,
      of: String,
    },
  },
  credentials: {
    sshKey: String,
    username: String,
    port: {
      type: Number,
      default: 22,
      min: 1,
      max: 65535,
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
serverSchema.index({ environment: 1 });
serverSchema.index({ type: 1 });
serverSchema.index({ isActive: 1 });
serverSchema.index({ tags: 1 });
serverSchema.index({ 'metadata.cluster': 1 });
serverSchema.index({ 'metadata.namespace': 1 });

export const Server = mongoose.model<IServer>('Server', serverSchema);
