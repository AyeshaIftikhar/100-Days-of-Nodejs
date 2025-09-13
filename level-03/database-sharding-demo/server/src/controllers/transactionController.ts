import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { generateTransactionId } from '../utils/generators';

export const transactionController = {
  // Get transactions with optional region filter
  async getTransactions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const regionId = req.query.regionId ? parseInt(req.query.regionId as string) : null;
      const status = req.query.status as string || null;

      // Create a filter object
      const filter: any = {};
      if (regionId !== null) filter.regionId = regionId;
      if (status) filter.status = status;

      const transactions = await Transaction.find(filter)
        .skip(skip)
        .limit(limit);

      const total = await Transaction.countDocuments(filter);

      return res.status(200).json({
        success: true,
        count: transactions.length,
        total,
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Get transaction by ID
  async getTransactionById(req: Request, res: Response) {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Create new transaction
  async createTransaction(req: Request, res: Response) {
    try {
      const { userId, productId, amount, regionId, status } = req.body;

      if (!userId || !productId || !amount || !regionId) {
        return res.status(400).json({
          success: false,
          error: 'Please provide userId, productId, amount, and regionId',
        });
      }

      const transactionId = generateTransactionId();
      const transaction = await Transaction.create({
        transactionId,
        userId,
        productId,
        amount,
        regionId,
        status: status || 'pending',
      });

      return res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Update transaction status
  async updateTransactionStatus(req: Request, res: Response) {
    try {
      const transactionId = req.params.transactionId;
      const { status } = req.body;

      if (!status || !['pending', 'completed', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid status: pending, completed, or failed',
        });
      }

      const transaction = await Transaction.findOneAndUpdate(
        { transactionId },
        { status },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
};
