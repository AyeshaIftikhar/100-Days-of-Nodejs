const contentService = require('../services/ContentService');
const { ValidationError } = require('../utils/errors');

class ContentController {
  async createType(ctx) {
    try {
      const { name, description, fields } = ctx.request.body;
      const userId = ctx.state.user.id;
      
      if (!name || !fields) {
        throw new ValidationError('Name and fields are required');
      }
      
      const contentType = await contentService.createContentType(
        name, 
        description, 
        fields, 
        userId
      );
      
      ctx.status = 201;
      ctx.body = contentType;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
  
  async createItem(ctx) {
    try {
      const { contentType } = ctx.params;
      const data = ctx.request.body;
      const userId = ctx.state.user.id;
      
      const item = await contentService.createContentItem(
        contentType, 
        data, 
        userId
      );
      
      ctx.status = 201;
      ctx.body = item;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
  
  async getItems(ctx) {
    try {
      const { contentType } = ctx.params;
      const { query, options } = ctx.request;
      
      const items = await contentService.queryContent(
        contentType, 
        query, 
        options
      );
      
      ctx.body = items;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
  
  async getItem(ctx) {
    try {
      const { contentType, id } = ctx.params;
      
      const item = await contentService.getContentItem(contentType, id);
      if (!item) {
        ctx.throw(404, 'Item not found');
      }
      
      ctx.body = item;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
  
  async updateItem(ctx) {
    try {
      const { contentType, id } = ctx.params;
      const data = ctx.request.body;
      
      const item = await contentService.updateContentItem(
        contentType, 
        id, 
        data
      );
      
      if (!item) {
        ctx.throw(404, 'Item not found');
      }
      
      ctx.body = item;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
  
  async deleteItem(ctx) {
    try {
      const { contentType, id } = ctx.params;
      
      const item = await contentService.deleteContentItem(contentType, id);
      if (!item) {
        ctx.throw(404, 'Item not found');
      }
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(error.status || 500, error.message);
    }
  }
}

module.exports = new ContentController();