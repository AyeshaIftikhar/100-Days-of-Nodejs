import mongoose, { Document, Schema } from 'mongoose';

export interface IMetric extends Document {
  _id: string;
  serverId: string;
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    available: number;
    percentage: number;
    devices: Array<{
      device: string;
      mountpoint: string;
      used: number;
      total: number;
      percentage: number;
    }>;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    interfaces: Array<{
      name: string;
      bytesIn: number;
      bytesOut: number;
    }>;
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
  };
  uptime: number;
  createdAt: Date;
}

const metricSchema = new Schema<IMetric>({
  serverId: {
    type: String,
    required: true,
    ref: 'Server',
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  cpu: {
    usage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cores: {
      type: Number,
      required: true,
      min: 1,
    },
    loadAverage: [{
      type: Number,
      required: true,
    }],
  },
  memory: {
    used: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  disk: {
    used: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    devices: [{
      device: String,
      mountpoint: String,
      used: Number,
      total: Number,
      percentage: Number,
    }],
  },
  network: {
    bytesIn: {
      type: Number,
      default: 0,
    },
    bytesOut: {
      type: Number,
      default: 0,
    },
    packetsIn: {
      type: Number,
      default: 0,
    },
    packetsOut: {
      type: Number,
      default: 0,
    },
    interfaces: [{
      name: String,
      bytesIn: Number,
      bytesOut: Number,
    }],
  },
  processes: {
    total: {
      type: Number,
      default: 0,
    },
    running: {
      type: Number,
      default: 0,
    },
    sleeping: {
      type: Number,
      default: 0,
    },
    zombie: {
      type: Number,
      default: 0,
    },
  },
  uptime: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for better query performance
metricSchema.index({ serverId: 1, timestamp: -1 });
metricSchema.index({ timestamp: -1 });
metricSchema.index({ 'cpu.usage': 1 });
metricSchema.index({ 'memory.percentage': 1 });
metricSchema.index({ 'disk.percentage': 1 });

// TTL index to automatically delete old metrics (30 days)
metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const Metric = mongoose.model<IMetric>('Metric', metricSchema);
