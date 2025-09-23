import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  _id: string;
  serverId: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold: {
    metric: string;
    value: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  };
  currentValue: number;
  status: 'active' | 'resolved' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notificationsSent: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>({
  serverId: {
    type: String,
    required: true,
    ref: 'Server',
  },
  type: {
    type: String,
    enum: ['cpu', 'memory', 'disk', 'network', 'custom'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  threshold: {
    metric: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    operator: {
      type: String,
      enum: ['gt', 'lt', 'eq', 'gte', 'lte'],
      required: true,
    },
  },
  currentValue: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active',
  },
  acknowledgedBy: {
    type: String,
    ref: 'User',
  },
  acknowledgedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  notificationsSent: {
    email: {
      type: Boolean,
      default: false,
    },
    slack: {
      type: Boolean,
      default: false,
    },
    webhook: {
      type: Boolean,
      default: false,
    },
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
alertSchema.index({ serverId: 1, status: 1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
