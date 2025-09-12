const apiService = require('../services/apiService');
const dynamicApiService = require('../services/dynamicApiService');

// @desc    Handle dynamic API requests
// @route   ANY /api/v1/:apiName/*
// @access  Public/Private (depending on API config)
exports.handleRequest = async (req, res, next) => {
  try {
    const apiName = req.params.apiName;
    
    // Find the API by name
    const api = await apiService.getApis(null, true);
    
    const foundApi = api.find(
      (a) => a.name.toLowerCase() === apiName.toLowerCase() && a.published
    );
    
    if (!foundApi) {
      return res.status(404).json({
        success: false,
        error: 'API not found or not published',
      });
    }
    
    // Extract the path from the URL
    // Remove the base path to get the endpoint path
    const fullPath = req.path;
    const basePath = `/${apiName}`;
    let endpointPath = fullPath.substring(basePath.length) || '/';
    
    // Process the request using the dynamic API service
    const operation = {
      method: req.method,
      path: endpointPath,
    };
    
    const result = await dynamicApiService.executeOperation(
      foundApi,
      operation,
      req.params,
      req.body,
      req.query,
      req.user
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
