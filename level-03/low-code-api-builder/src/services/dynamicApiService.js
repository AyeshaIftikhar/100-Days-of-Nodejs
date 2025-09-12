const vm = require('vm');
const mongoose = require('mongoose');
const apiService = require('./apiService');

class DynamicApiService {
  // Execute CRUD operations on the dynamic model
  async executeOperation(api, operation, params = {}, body = {}, query = {}, user = null) {
    const Model = apiService.getDynamicModel(api);
    
    // Find the endpoint with the matching operation and path
    const endpoint = api.endpoints.find(
      (e) => e.method === operation.method && e.path === operation.path
    );
    
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }
    
    // Check if endpoint is enabled
    if (!endpoint.enabled) {
      throw new Error('Endpoint is disabled');
    }
    
    // Check auth requirements
    if (endpoint.requireAuth && !user) {
      throw new Error('Authentication required');
    }
    
    // Check role requirements
    if (endpoint.requireAuth && user && !endpoint.roles.includes(user.role)) {
      throw new Error('Not authorized for this endpoint');
    }
    
    // Execute custom logic if defined
    if (endpoint.customLogic) {
      try {
        // Create a sandbox with necessary context
        const sandbox = {
          params,
          query,
          body,
          user,
          Model,
          mongoose,
          result: null,
          console: console,
        };
        
        // Execute the custom logic
        const script = new vm.Script(endpoint.customLogic);
        const context = vm.createContext(sandbox);
        script.runInContext(context);
        
        // Return the result from the sandbox
        return sandbox.result;
      } catch (error) {
        throw new Error(`Custom logic error: ${error.message}`);
      }
    }
    
    // Execute default CRUD operation if no custom logic
    switch (operation.method) {
      case 'GET':
        if (params.id) {
          return await Model.findById(params.id);
        } else {
          const options = {};
          
          // Handle pagination
          if (query.page && query.limit) {
            const page = parseInt(query.page, 10) || 1;
            const limit = parseInt(query.limit, 10) || 10;
            const skip = (page - 1) * limit;
            
            options.skip = skip;
            options.limit = limit;
          }
          
          // Handle sorting
          if (query.sort) {
            options.sort = query.sort.split(',').join(' ');
          }
          
          // Handle filtering
          const filter = {};
          Object.keys(query).forEach((key) => {
            if (!['page', 'limit', 'sort'].includes(key)) {
              filter[key] = query[key];
            }
          });
          
          return await Model.find(filter, null, options);
        }
      
      case 'POST':
        return await Model.create(body);
      
      case 'PUT':
        if (!params.id) {
          throw new Error('ID parameter is required');
        }
        return await Model.findByIdAndUpdate(params.id, body, {
          new: true,
          runValidators: true,
        });
      
      case 'PATCH':
        if (!params.id) {
          throw new Error('ID parameter is required');
        }
        return await Model.findByIdAndUpdate(params.id, body, {
          new: true,
          runValidators: true,
        });
      
      case 'DELETE':
        if (!params.id) {
          throw new Error('ID parameter is required');
        }
        await Model.findByIdAndDelete(params.id);
        return { success: true };
      
      default:
        throw new Error('Unsupported operation');
    }
  }
}

module.exports = new DynamicApiService();
