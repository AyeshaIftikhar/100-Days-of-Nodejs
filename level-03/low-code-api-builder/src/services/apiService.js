const Api = require('../models/Api');
const mongoose = require('mongoose');

class ApiService {
  // Create a new API definition
  async createApi(apiData, userId) {
    const api = await Api.create({
      ...apiData,
      createdBy: userId,
    });
    
    return api;
  }

  // Get all APIs created by a user
  async getApis(userId, includeUnpublished = false) {
    const query = { createdBy: userId };
    
    if (!includeUnpublished) {
      query.published = true;
    }
    
    const apis = await Api.find(query);
    return apis;
  }

  // Get a single API by ID
  async getApiById(apiId, userId) {
    const api = await Api.findOne({
      _id: apiId,
      createdBy: userId,
    });
    
    if (!api) {
      throw new Error('API not found');
    }
    
    return api;
  }

  // Update an API definition
  async updateApi(apiId, apiData, userId) {
    const api = await Api.findOneAndUpdate(
      { _id: apiId, createdBy: userId },
      apiData,
      { new: true, runValidators: true }
    );
    
    if (!api) {
      throw new Error('API not found');
    }
    
    return api;
  }

  // Delete an API definition
  async deleteApi(apiId, userId) {
    const api = await Api.findOne({ _id: apiId, createdBy: userId });
    
    if (!api) {
      throw new Error('API not found');
    }
    
    // First delete the dynamic model collection if it exists
    const modelName = api.name.charAt(0).toUpperCase() + api.name.slice(1);
    if (mongoose.models[modelName]) {
      try {
        await mongoose.connection.dropCollection(modelName.toLowerCase() + 's');
      } catch (error) {
        // Collection may not exist yet, that's fine
      }
    }
    
    await api.remove();
    return { success: true };
  }

  // Publish or unpublish an API
  async togglePublishStatus(apiId, userId) {
    const api = await Api.findOne({ _id: apiId, createdBy: userId });
    
    if (!api) {
      throw new Error('API not found');
    }
    
    api.published = !api.published;
    await api.save();
    
    return api;
  }

  // Create the dynamic model from API definition
  getDynamicModel(api) {
    return api.createModel();
  }
}

module.exports = new ApiService();
