import { Request, Response } from 'express';
import { blockchain } from '../../simulator/blockchain';

/**
 * Controller for network-related endpoints
 */
export class NetworkController {
  /**
   * Get network statistics
   */
  public static getNetworkStats(req: Request, res: Response): void {
    try {
      const stats = blockchain.getNetworkStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching network stats'
      });
    }
  }
  
  /**
   * Search for blocks, transactions, or addresses
   */
  public static search(req: Request, res: Response): void {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Missing search query parameter (q)'
        });
        return;
      }
      
      const results = blockchain.search(query);
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while searching'
      });
    }
  }
}
