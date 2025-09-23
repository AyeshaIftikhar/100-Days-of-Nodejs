import { Request, Response } from 'express';
import { blockchain } from '../../simulator/blockchain';

/**
 * Controller for transaction-related endpoints
 */
export class TransactionController {
  /**
   * Get all transactions in the blockchain
   */
  public static getAllTransactions(req: Request, res: Response): void {
    try {
      // Get all blocks
      const blocks = blockchain.getBlocks();
      
      // Extract transactions from all blocks
      const transactions = blocks.flatMap(block => block.transactions);
      
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching transactions'
      });
    }
  }
  
  /**
   * Get all pending transactions
   */
  public static getPendingTransactions(req: Request, res: Response): void {
    try {
      const pendingTransactions = blockchain.getPendingTransactions();
      
      res.status(200).json({
        success: true,
        data: pendingTransactions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching pending transactions'
      });
    }
  }
  
  /**
   * Get a specific transaction by its ID
   */
  public static getTransactionById(req: Request, res: Response): void {
    try {
      const id = req.params.id;
      
      const transaction = blockchain.getTransaction(id);
      
      if (!transaction) {
        res.status(404).json({
          success: false,
          error: `Transaction with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching the transaction'
      });
    }
  }
  
  /**
   * Create a new transaction
   */
  public static createTransaction(req: Request, res: Response): void {
    try {
      const { sender, recipient, amount, fee } = req.body;
      
      // Validate input
      if (!sender || !recipient || !amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: sender, recipient, amount'
        });
        return;
      }
      
      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be a positive number'
        });
        return;
      }
      
      // Create the transaction
      const transaction = blockchain.createTransaction(
        sender,
        recipient,
        amount,
        fee || 0.001
      );
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      // Check if this is a known error type
      if (
        error.message.includes('Sender and recipient cannot be the same') ||
        error.message.includes('Amount must be greater than 0') ||
        error.message.includes('Insufficient balance')
      ) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'An error occurred while creating the transaction'
        });
      }
    }
  }
}
