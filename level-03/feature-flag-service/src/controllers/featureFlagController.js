const featureFlagService = require('../services/featureFlagService');
const logger = require('../utils/logger');

// Custom error class
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

const featureFlagController = {
  /**
   * Create a new feature flag
   * @route POST /api/projects/:projectId/flags
   */
  createFlag: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const flagData = {
        ...req.body,
        project: projectId,
        createdBy: req.user.id,
      };
      
      // Validate that the flag key is unique for this project
      const existingFlag = await featureFlagService.getFlagByKey(projectId, req.body.key);
      if (existingFlag) {
        throw new ApiError(`Feature flag with key '${req.body.key}' already exists in this project`, 400);
      }
      
      const flag = await featureFlagService.createFlag(flagData);
      
      res.status(201).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get all feature flags for a project
   * @route GET /api/projects/:projectId/flags
   */
  getProjectFlags: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const flags = await featureFlagService.getProjectFlags(projectId);
      
      res.status(200).json({
        success: true,
        count: flags.length,
        data: flags,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a single feature flag
   * @route GET /api/flags/:id
   */
  getFlag: async (req, res, next) => {
    try {
      const flag = await featureFlagService.getFlagById(req.params.id);
      
      if (!flag) {
        throw new ApiError('Feature flag not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update a feature flag
   * @route PUT /api/flags/:id
   */
  updateFlag: async (req, res, next) => {
    try {
      // Make sure key cannot be updated
      if (req.body.key) {
        delete req.body.key;
      }
      
      const flag = await featureFlagService.updateFlag(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete a feature flag
   * @route DELETE /api/flags/:id
   */
  deleteFlag: async (req, res, next) => {
    try {
      await featureFlagService.deleteFlag(req.params.id);
      
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Evaluate a feature flag
   * @route POST /api/projects/:projectId/evaluate
   */
  evaluateFlag: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { flagKey, environment, userId, context } = req.body;
      
      if (!flagKey || !environment || !userId) {
        throw new ApiError('Missing required fields: flagKey, environment, and userId are required', 400);
      }
      
      const result = await featureFlagService.evaluateFlag(projectId, flagKey, environment, userId, context || {});
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Batch evaluate multiple feature flags
   * @route POST /api/projects/:projectId/evaluate-batch
   */
  evaluateBatch: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { flagKeys, environment, userId, context } = req.body;
      
      if (!flagKeys || !Array.isArray(flagKeys) || !environment || !userId) {
        throw new ApiError('Missing required fields: flagKeys (array), environment, and userId are required', 400);
      }
      
      const results = {};
      
      // Evaluate each flag
      for (const flagKey of flagKeys) {
        try {
          results[flagKey] = await featureFlagService.evaluateFlag(projectId, flagKey, environment, userId, context || {});
        } catch (error) {
          logger.error(`Error evaluating flag ${flagKey}:`, error);
          results[flagKey] = {
            enabled: false,
            error: error.message,
          };
        }
      }
      
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get feature flag analytics
   * @route GET /api/flags/:id/analytics
   */
  getFlagAnalytics: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { environment, startDate, endDate } = req.query;
      
      if (!environment) {
        throw new ApiError('Environment parameter is required', 400);
      }
      
      const analytics = await featureFlagService.getEvaluationAnalytics(id, environment, startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = featureFlagController;
