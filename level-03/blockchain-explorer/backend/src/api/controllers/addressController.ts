import { Request, Response } from 'express';
import { blockchain } from '../../simulator/blockchain';

/**
 * Controller for address-related endpoints
 */
export class AddressController {
  /**
   * Get all addresses in the blockchain
   */
  public static getAllAddresses(req: Request, res: Response): void {
    try {
      const addresses = blockchain.getAddresses();
      
      res.status(200).json({
        success: true,
        data: addresses
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching addresses'
      });
    }
  }
  
  /**
   * Get information about a specific address
   */
  public static getAddressInfo(req: Request, res: Response): void {
    try {
      const address = req.params.address;
      
      const addressInfo = blockchain.getAddress(address);
      
      if (!addressInfo) {
        res.status(404).json({
          success: false,
          error: `Address ${address} not found`
        });
        return;
      }
      
      // Get all blocks to find transactions involving this address
      const blocks = blockchain.getBlocks();
      
      // Extract transactions from all blocks
      const allTransactions = blocks.flatMap(block => block.transactions);
      
      // Filter transactions involving this address
      const transactions = allTransactions.filter(
        tx => tx.sender === address || tx.recipient === address
      );
      
      // Get pending transactions involving this address
      const pendingTransactions = blockchain.getPendingTransactions().filter(
        tx => tx.sender === address || tx.recipient === address
      );
      
      res.status(200).json({
        success: true,
        data: {
          ...addressInfo,
          transactions,
          pendingTransactions
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching address info'
      });
    }
  }
}
