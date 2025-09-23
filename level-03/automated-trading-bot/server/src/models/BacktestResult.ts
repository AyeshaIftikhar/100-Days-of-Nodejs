import mongoose, { Schema, Document } from 'mongoose';
import { IBacktestResult, SignalDirection, TimeFrame } from '../types';

export interface IBacktestResultDocument extends IBacktestResult, Document {}

const BacktestResultSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    strategyId: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    market: {
      type: String,
      required: [true, 'Market is required'],
      trim: true,
    },
    timeframe: {
      type: String,
      enum: Object.values(TimeFrame),
      required: [true, 'Timeframe is required'],
    },
    trades: [
      {
        entryTime: {
          type: Date,
          required: true,
        },
        exitTime: {
          type: Date,
        },
        entryPrice: {
          type: Number,
          required: true,
        },
        exitPrice: {
          type: Number,
        },
        direction: {
          type: String,
          enum: Object.values(SignalDirection),
          required: true,
        },
        pnl: {
          type: Number,
        },
        pnlPercentage: {
          type: Number,
        },
      },
    ],
    metrics: {
      totalTrades: {
        type: Number,
        required: true,
      },
      winningTrades: {
        type: Number,
        required: true,
      },
      losingTrades: {
        type: Number,
        required: true,
      },
      winRate: {
        type: Number,
        required: true,
      },
      profitFactor: {
        type: Number,
        required: true,
      },
      totalReturn: {
        type: Number,
        required: true,
      },
      maxDrawdown: {
        type: Number,
        required: true,
      },
      sharpeRatio: {
        type: Number,
        required: true,
      },
      averageReturn: {
        type: Number,
        required: true,
      },
      averageWin: {
        type: Number,
        required: true,
      },
      averageLoss: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BacktestResultSchema.index({ userId: 1, strategyId: 1 });
BacktestResultSchema.index({ createdAt: -1 });

const BacktestResult = mongoose.model<IBacktestResultDocument>(
  'BacktestResult',
  BacktestResultSchema
);

export default BacktestResult;
