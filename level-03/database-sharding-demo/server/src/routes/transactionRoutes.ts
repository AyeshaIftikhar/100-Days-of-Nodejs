import express from 'express';
import { transactionController } from '../controllers/transactionController';

const router = express.Router();

// Transaction routes
router.get('/', transactionController.getTransactions);
router.get('/:transactionId', transactionController.getTransactionById);
router.post('/', transactionController.createTransaction);
router.patch('/:transactionId/status', transactionController.updateTransactionStatus);

export default router;
