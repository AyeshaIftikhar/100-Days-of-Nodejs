import { Request, Response } from 'express';
import { blockchain } from '../../simulator/blockchain';

/**
 * Controller for block-related endpoints
 */
export class BlockController {
  /**
   * Get all blocks in the blockchain
   */
  public static getAllBlocks(req: Request, res: Response): void {
    try {
      const blocks = blockchain.getBlocks();
      res.status(200).json({
        success: true,
        data: blocks
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching blocks'
      });
    }
  }
  
  /**
   * Get a specific block by its index
   */
  public static getBlockByIndex(req: Request, res: Response): void {
    try {
      const index = parseInt(req.params.index);
      
      if (isNaN(index)) {
        res.status(400).json({
          success: false,
          error: 'Invalid block index'
        });
        return;
      }
      
      const block = blockchain.getBlock(index);
      
      if (!block) {
        res.status(404).json({
          success: false,
          error: `Block with index ${index} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: block
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching the block'
      });
    }
  }
}
