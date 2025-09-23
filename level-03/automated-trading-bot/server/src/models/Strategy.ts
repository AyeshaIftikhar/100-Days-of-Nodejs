import mongoose, { Schema, Document } from 'mongoose';
import { IStrategy, StrategyType, TimeFrame } from '../types';

export interface IStrategyDocument extends IStrategy, Document {}

const StrategySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Strategy name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(StrategyType),
      required: [true, 'Strategy type is required'],
    },
    market: {
      type: String,
      required: [true, 'Market symbol is required'],
      trim: true,
    },
    timeframe: {
      type: String,
      enum: Object.values(TimeFrame),
      required: [true, 'Timeframe is required'],
    },
    indicators: [
      {
        type: {
          type: String,
          required: true,
        },
        params: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    entryConditions: [
      {
        indicatorIndex: {
          type: Number,
          required: true,
        },
        comparator: {
          type: String,
          enum: ['greater_than', 'less_than', 'equal_to', 'crosses_above', 'crosses_below'],
          required: true,
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
        },
        property: {
          type: String,
        },
      },
    ],
    exitConditions: [
      {
        indicatorIndex: {
          type: Number,
          required: true,
        },
        comparator: {
          type: String,
          enum: ['greater_than', 'less_than', 'equal_to', 'crosses_above', 'crosses_below'],
          required: true,
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
        },
        property: {
          type: String,
        },
      },
    ],
    riskManagement: {
      stopLossPercentage: {
        type: Number,
      },
      takeProfitPercentage: {
        type: Number,
      },
      maxPositionSize: {
        type: Number,
      },
      trailingStopPercentage: {
        type: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isBacktested: {
      type: Boolean,
      default: false,
    },
    paperTrading: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
StrategySchema.index({ userId: 1, name: 1 }, { unique: true });
StrategySchema.index({ isActive: 1 });

const Strategy = mongoose.model<IStrategyDocument>('Strategy', StrategySchema);

export default Strategy;
