import { Express } from 'express';
import { BlockController } from './controllers/blockController';
import { TransactionController } from './controllers/transactionController';
import { AddressController } from './controllers/addressController';
import { NetworkController } from './controllers/networkController';
import { simulationController } from './controllers/simulationController';

/**
 * Registers all API routes
 */
export function registerRoutes(app: Express): void {
  // Block routes
  app.get('/api/blocks', BlockController.getAllBlocks);
  app.get('/api/blocks/:index', BlockController.getBlockByIndex);
  
  // Transaction routes
  app.get('/api/transactions', TransactionController.getAllTransactions);
  app.get('/api/transactions/pending', TransactionController.getPendingTransactions);
  app.get('/api/transactions/:id', TransactionController.getTransactionById);
  app.post('/api/transactions', TransactionController.createTransaction);
  
  // Address routes
  app.get('/api/addresses', AddressController.getAllAddresses);
  app.get('/api/addresses/:address', AddressController.getAddressInfo);
  
  // Network routes
  app.get('/api/network/stats', NetworkController.getNetworkStats);
  app.get('/api/search', NetworkController.search);
  
  // Simulation routes
  app.get('/api/simulation/status', (req, res) => {
    res.status(200).json({
      success: true,
      data: simulationController.getStatus()
    });
  });
  app.post('/api/simulation/start', (req, res) => {
    simulationController.startSimulation();
    res.status(200).json({
      success: true,
      message: 'Simulation started successfully'
    });
  });
  app.post('/api/simulation/stop', (req, res) => {
    simulationController.stopSimulation();
    res.status(200).json({
      success: true,
      message: 'Simulation stopped successfully'
    });
  });
  app.post('/api/simulation/mine', (req, res) => {
    try {
      const { minerAddress } = req.body;
      if (!minerAddress) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: minerAddress'
        });
      }
      simulationController.mineBlock(minerAddress);
      res.status(200).json({
        success: true,
        message: 'Block mined successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while mining the block'
      });
    }
  });
}
