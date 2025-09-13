import mongoose from 'mongoose';

// Types for Transaction model
export interface ITransaction {
  transactionId: string;
  userId: string;
  productId: string;
  amount: number;
  regionId: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    amount: { type: Number, required: true },
    regionId: { type: Number, required: true },
    status: { 
      type: String, 
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
