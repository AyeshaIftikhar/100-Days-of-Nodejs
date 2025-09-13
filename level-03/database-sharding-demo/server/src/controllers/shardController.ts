import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ShardStatus } from '../models/ShardStatus';
import { shardingService } from '../services/shardingService';

export const shardController = {
  // Get all shard statuses
  async getShardStatus(req: Request, res: Response) {
    try {
      const shards = await ShardStatus.find();
      
      return res.status(200).json({
        success: true,
        count: shards.length,
        data: shards,
      });
    } catch (error) {
      console.error('Error fetching shard status:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Get shard statistics and data distribution
  async getShardStatistics(req: Request, res: Response) {
    try {
      const stats = await shardingService.getShardingStatistics();
      
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching shard statistics:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
  
  // Get performance metrics comparing sharded vs non-sharded
  async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const collection = req.query.collection as string;
      if (!collection) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a collection name',
        });
      }
      
      const metrics = await shardingService.getPerformanceMetrics(collection);
      
      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
  
  // Run a rebalancing operation on the cluster
  async rebalanceShards(req: Request, res: Response) {
    try {
      const result = await shardingService.rebalanceShards();
      
      return res.status(200).json({
        success: true,
        message: 'Rebalancing operation started',
        data: result,
      });
    } catch (error) {
      console.error('Error during shard rebalancing:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
};
