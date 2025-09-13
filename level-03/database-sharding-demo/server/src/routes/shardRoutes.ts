import express from 'express';
import { shardController } from '../controllers/shardController';

const router = express.Router();

// Shard routes
router.get('/', shardController.getShardStatus);
router.get('/statistics', shardController.getShardStatistics);
router.get('/performance', shardController.getPerformanceMetrics);
router.post('/rebalance', shardController.rebalanceShards);

export default router;
