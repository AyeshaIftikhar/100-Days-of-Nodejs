import mongoose, { Schema, Document } from 'mongoose';
import { ITrade, SignalDirection, TradeStatus } from '../types';

export interface ITradeDocument extends ITrade, Document {}

const TradeSchema: Schema = new Schema(
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
    exchange: {
      type: String,
      required: [true, 'Exchange is required'],
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      trim: true,
    },
    direction: {
      type: String,
      enum: Object.values(SignalDirection),
      required: [true, 'Trade direction is required'],
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
    },
    exitPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    entryTime: {
      type: Date,
      required: [true, 'Entry time is required'],
      default: Date.now,
    },
    exitTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(TradeStatus),
      default: TradeStatus.OPEN,
    },
    pnl: {
      type: Number,
    },
    pnlPercentage: {
      type: Number,
    },
    fees: {
      type: Number,
    },
    notes: {
      type: String,
    },
    orderId: {
      type: String,
    },
    paperTrade: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate PnL when trade is closed
TradeSchema.pre('save', function (next) {
  const trade = this as ITradeDocument;
  
  // Calculate PnL only when trade is closed and has both entry and exit prices
  if (
    trade.isModified('status') &&
    trade.status === TradeStatus.CLOSED &&
    trade.entryPrice &&
    trade.exitPrice
  ) {
    if (trade.direction === SignalDirection.BUY) {
      // For BUY trades: (exitPrice - entryPrice) * quantity
      trade.pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
      trade.pnlPercentage = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    } else if (trade.direction === SignalDirection.SELL) {
      // For SELL trades: (entryPrice - exitPrice) * quantity
      trade.pnl = (trade.entryPrice - trade.exitPrice) * trade.quantity;
      trade.pnlPercentage = ((trade.entryPrice - trade.exitPrice) / trade.entryPrice) * 100;
    }
  }
  
  next();
});

// Indexes for faster queries
TradeSchema.index({ userId: 1, status: 1 });
TradeSchema.index({ strategyId: 1, status: 1 });
TradeSchema.index({ entryTime: -1 });

const Trade = mongoose.model<ITradeDocument>('Trade', TradeSchema);

export default Trade;
