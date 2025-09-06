const FeatureFlag = require('../models/FeatureFlag');
const Evaluation = require('../models/Evaluation');
const logger = require('../utils/logger');
const { createRedisClient } = require('../utils/redis');

class FeatureFlagService {
  constructor() {
    this.cacheEnabled = process.env.NODE_ENV === 'production';
    this.redis = null;
    
    if (this.cacheEnabled) {
      this.initRedis();
    }
  }
  
  async initRedis() {
    try {
      this.redis = await createRedisClient();
      logger.info('Redis cache initialized for FeatureFlagService');
    } catch (error) {
      logger.error('Failed to initialize Redis cache:', error);
      // Continue without caching
      this.cacheEnabled = false;
    }
  }
  
  // Cache key generation
  getCacheKey(projectId, environment, flagKey) {
    return `flag:${projectId}:${environment}:${flagKey}`;
  }
  
  // Create a new feature flag
  async createFlag(flagData) {
    try {
      const flag = await FeatureFlag.create(flagData);
      logger.info(`Feature flag created: ${flag.key}`);
      return flag;
    } catch (error) {
      logger.error(`Error creating feature flag: ${error.message}`);
      throw error;
    }
  }
  
  // Get a flag by ID
  async getFlagById(id) {
    try {
      const flag = await FeatureFlag.findById(id);
      return flag;
    } catch (error) {
      logger.error(`Error fetching feature flag by ID: ${error.message}`);
      throw error;
    }
  }
  
  // Get a flag by project and key
  async getFlagByKey(projectId, key) {
    try {
      const flag = await FeatureFlag.findOne({ project: projectId, key });
      return flag;
    } catch (error) {
      logger.error(`Error fetching feature flag by key: ${error.message}`);
      throw error;
    }
  }
  
  // Get all flags for a project
  async getProjectFlags(projectId) {
    try {
      const flags = await FeatureFlag.find({ project: projectId }).sort({ updatedAt: -1 });
      return flags;
    } catch (error) {
      logger.error(`Error fetching project flags: ${error.message}`);
      throw error;
    }
  }
  
  // Update a feature flag
  async updateFlag(id, updateData) {
    try {
      const flag = await FeatureFlag.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      
      if (!flag) {
        throw new Error('Feature flag not found');
      }
      
      // Invalidate cache if enabled
      if (this.cacheEnabled && this.redis) {
        const cacheKey = this.getCacheKey(flag.project.toString(), '*', flag.key);
        await this.redis.del(cacheKey);
        logger.debug(`Cache invalidated for ${flag.key}`);
      }
      
      logger.info(`Feature flag updated: ${flag.key}`);
      return flag;
    } catch (error) {
      logger.error(`Error updating feature flag: ${error.message}`);
      throw error;
    }
  }
  
  // Delete a feature flag
  async deleteFlag(id) {
    try {
      const flag = await FeatureFlag.findById(id);
      
      if (!flag) {
        throw new Error('Feature flag not found');
      }
      
      // Invalidate cache if enabled
      if (this.cacheEnabled && this.redis) {
        const cacheKey = this.getCacheKey(flag.project.toString(), '*', flag.key);
        await this.redis.del(cacheKey);
      }
      
      await flag.remove();
      logger.info(`Feature flag deleted: ${flag.key}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting feature flag: ${error.message}`);
      throw error;
    }
  }
  
  // Evaluate a feature flag for a user in a specific environment
  async evaluateFlag(projectId, flagKey, environment, userId, context = {}) {
    try {
      // Try to get from cache first
      let flag;
      const cacheKey = this.getCacheKey(projectId, environment, flagKey);
      
      if (this.cacheEnabled && this.redis) {
        const cachedFlag = await this.redis.get(cacheKey);
        if (cachedFlag) {
          flag = JSON.parse(cachedFlag);
          logger.debug(`Cache hit for ${flagKey} in ${environment}`);
        }
      }
      
      // If not in cache, fetch from database
      if (!flag) {
        flag = await FeatureFlag.findOne({ project: projectId, key: flagKey });
        
        if (!flag) {
          throw new Error(`Feature flag not found: ${flagKey}`);
        }
        
        // Store in cache if enabled
        if (this.cacheEnabled && this.redis) {
          await this.redis.set(cacheKey, JSON.stringify(flag), 'EX', 300); // Cache for 5 minutes
          logger.debug(`Cached ${flagKey} in ${environment}`);
        }
      }
      
      // Find the environment configuration
      const envConfig = flag.environments.find(env => env.name === environment);
      
      if (!envConfig) {
        throw new Error(`Environment not found: ${environment}`);
      }
      
      // Start with the result being disabled
      let result = {
        enabled: false,
        variant: null,
        value: null,
        reason: 'Feature flag is disabled',
      };
      
      // If the flag is enabled for this environment, evaluate rules
      if (envConfig.enabled) {
        // Start with the default result
        result = {
          enabled: true,
          variant: envConfig.defaultVariant,
          value: this.getVariantValue(flag, envConfig.defaultVariant),
          reason: 'Default variant',
        };
        
        // Check rollout percentage - use userId to ensure consistent results
        const userPercentage = this.getUserPercentage(userId);
        if (userPercentage > envConfig.rolloutPercentage) {
          result.enabled = false;
          result.reason = `User outside rollout percentage (${userPercentage} > ${envConfig.rolloutPercentage})`;
          return result;
        }
        
        // Check targeting rules
        if (envConfig.rules && envConfig.rules.length > 0) {
          let ruleMatch = false;
          
          for (const rule of envConfig.rules) {
            if (this.evaluateRule(rule, context)) {
              ruleMatch = true;
              // If variant is specified in the rule, use that
              if (rule.variant) {
                result.variant = rule.variant;
                result.value = this.getVariantValue(flag, rule.variant);
                result.reason = `Matched targeting rule for attribute ${rule.attribute}`;
              }
              break;
            }
          }
          
          // If no rules matched and we require a rule match
          if (!ruleMatch && envConfig.requireRuleMatch) {
            result.enabled = false;
            result.reason = 'No targeting rules matched';
          }
        }
        
        // Handle variant weights for A/B testing
        if (result.enabled && flag.variants.length > 1) {
          // Only apply weighted distribution if no specific variant was assigned by rules
          if (result.reason === 'Default variant') {
            const selectedVariant = this.getWeightedVariant(flag.variants, userId);
            if (selectedVariant) {
              result.variant = selectedVariant.name;
              result.value = selectedVariant.value;
              result.reason = 'Selected by variant weight distribution';
            }
          }
        }
      }
      
      // Log the evaluation
      await this.logEvaluation(flag._id, environment, userId, context, result);
      
      return result;
    } catch (error) {
      logger.error(`Error evaluating feature flag: ${error.message}`);
      throw error;
    }
  }
  
  // Get a variant value
  getVariantValue(flag, variantName) {
    const variant = flag.variants.find(v => v.name === variantName);
    return variant ? variant.value : null;
  }
  
  // Evaluate a single rule against context
  evaluateRule(rule, context) {
    // If attribute doesn't exist in context, rule doesn't match
    if (!context.hasOwnProperty(rule.attribute)) {
      return false;
    }
    
    const contextValue = context[rule.attribute];
    
    switch (rule.operator) {
      case 'equals':
        return contextValue === rule.values[0];
        
      case 'notEquals':
        return contextValue !== rule.values[0];
        
      case 'contains':
        return String(contextValue).includes(rule.values[0]);
        
      case 'notContains':
        return !String(contextValue).includes(rule.values[0]);
        
      case 'greaterThan':
        return contextValue > rule.values[0];
        
      case 'lessThan':
        return contextValue < rule.values[0];
        
      case 'in':
        return rule.values.includes(contextValue);
        
      case 'notIn':
        return !rule.values.includes(contextValue);
        
      case 'startsWith':
        return String(contextValue).startsWith(rule.values[0]);
        
      case 'endsWith':
        return String(contextValue).endsWith(rule.values[0]);
        
      default:
        return false;
    }
  }
  
  // Get a consistent percentage (0-100) for a user
  getUserPercentage(userId) {
    // Use a simple hash of the userId to get a consistent percentage
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Make sure it's positive and between 0-100
    return Math.abs(hash) % 100;
  }
  
  // Get a variant based on weights
  getWeightedVariant(variants, userId) {
    // First, filter to only variants with weights > 0
    const weightedVariants = variants.filter(v => v.weight > 0);
    
    if (weightedVariants.length === 0) {
      return null;
    }
    
    // Get a consistent percentage for this user and flag combination
    const percentage = this.getUserPercentage(userId);
    
    // Calculate cumulative weights
    let cumulativeWeight = 0;
    for (const variant of weightedVariants) {
      cumulativeWeight += variant.weight;
      if (percentage <= cumulativeWeight) {
        return variant;
      }
    }
    
    // If we get here, return the last variant
    return weightedVariants[weightedVariants.length - 1];
  }
  
  // Log an evaluation for analytics
  async logEvaluation(flagId, environment, userId, context, result) {
    try {
      await Evaluation.create({
        featureFlag: flagId,
        environment,
        userId,
        context,
        result,
      });
    } catch (error) {
      logger.error(`Error logging evaluation: ${error.message}`);
      // Don't throw, just log - evaluation logging should not block the response
    }
  }
  
  // Get evaluation analytics
  async getEvaluationAnalytics(flagId, environment, startDate, endDate) {
    try {
      const query = {
        featureFlag: flagId,
        environment,
      };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          query.timestamp.$lte = new Date(endDate);
        }
      }
      
      // Get total counts
      const totalCount = await Evaluation.countDocuments(query);
      
      // Get enabled counts
      const enabledQuery = { ...query, 'result.enabled': true };
      const enabledCount = await Evaluation.countDocuments(enabledQuery);
      
      // Get variant distribution
      const variantDistribution = await Evaluation.aggregate([
        { $match: { ...query, 'result.enabled': true } },
        { $group: { _id: '$result.variant', count: { $sum: 1 } } },
        { $project: { _id: 0, variant: '$_id', count: 1, percentage: { $multiply: [{ $divide: ['$count', enabledCount] }, 100] } } },
      ]);
      
      // Get unique users
      const uniqueUsers = await Evaluation.distinct('userId', query);
      
      return {
        totalEvaluations: totalCount,
        enabledCount,
        disabledCount: totalCount - enabledCount,
        enabledPercentage: totalCount > 0 ? (enabledCount / totalCount) * 100 : 0,
        uniqueUsers: uniqueUsers.length,
        variantDistribution,
      };
    } catch (error) {
      logger.error(`Error getting evaluation analytics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FeatureFlagService();
