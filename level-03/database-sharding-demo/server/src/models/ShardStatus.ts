import mongoose from 'mongoose';

// Types for ShardStatus model
export interface IShardStatus {
  shardId: string;
  name: string;
  host: string;
  status: 'online' | 'offline' | 'rebalancing';
  documentCount: number;
  tags: string[];
  lastUpdated: Date;
}

const shardStatusSchema = new mongoose.Schema<IShardStatus>(
  {
    shardId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    host: { type: String, required: true },
    status: { 
      type: String, 
      required: true,
      enum: ['online', 'offline', 'rebalancing'],
      default: 'online'
    },
    documentCount: { type: Number, required: true, default: 0 },
    tags: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
  }
);

export const ShardStatus = mongoose.model<IShardStatus>('ShardStatus', shardStatusSchema);
