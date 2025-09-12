const apiService = require('../services/apiService');

// @desc    Create a new API
// @route   POST /api/v1/apis
// @access  Private
exports.createApi = async (req, res, next) => {
  try {
    const api = await apiService.createApi(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      data: api,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all APIs for logged in user
// @route   GET /api/v1/apis
// @access  Private
exports.getApis = async (req, res, next) => {
  try {
    const includeUnpublished = req.user.role === 'admin' || req.query.includeUnpublished === 'true';
    const apis = await apiService.getApis(req.user.id, includeUnpublished);
    
    res.status(200).json({
      success: true,
      count: apis.length,
      data: apis,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single API
// @route   GET /api/v1/apis/:id
// @access  Private
exports.getApi = async (req, res, next) => {
  try {
    const api = await apiService.getApiById(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: api,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update API
// @route   PUT /api/v1/apis/:id
// @access  Private
exports.updateApi = async (req, res, next) => {
  try {
    const api = await apiService.updateApi(req.params.id, req.body, req.user.id);
    
    res.status(200).json({
      success: true,
      data: api,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete API
// @route   DELETE /api/v1/apis/:id
// @access  Private
exports.deleteApi = async (req, res, next) => {
  try {
    await apiService.deleteApi(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle API publish status
// @route   PUT /api/v1/apis/:id/publish
// @access  Private
exports.togglePublishStatus = async (req, res, next) => {
  try {
    const api = await apiService.togglePublishStatus(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: api,
    });
  } catch (err) {
    next(err);
  }
};
