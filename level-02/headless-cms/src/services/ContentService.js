const mongoose = require('mongoose');
const ContentType = require('../models/ContentType');

class ContentService {
  constructor() {
    this.dynamicModels = {};
  }
  
  async createContentType(name, description, fields, userId) {
    const contentType = new ContentType({
      name,
      description,
      fields,
      createdBy: userId
    });
    
    await contentType.save();
    this.registerModel(contentType);
    return contentType;
  }
  
  registerModel(contentType) {
    const schema = ContentType.generateModel(contentType);
    this.dynamicModels[contentType.name] = mongoose.model(
      contentType.name, 
      schema
    );
  }
  
  async getContentItem(contentType, id) {
    const Model = this.dynamicModels[contentType];
    if (!Model) throw new Error('Content type not found');
    return Model.findById(id).populate('createdBy');
  }
  
  async createContentItem(contentType, data, userId) {
    const Model = this.dynamicModels[contentType];
    if (!Model) throw new Error('Content type not found');
    
    const item = new Model({ ...data, createdBy: userId });
    return item.save();
  }
  
  async updateContentItem(contentType, id, data) {
    const Model = this.dynamicModels[contentType];
    if (!Model) throw new Error('Content type not found');
    
    return Model.findByIdAndUpdate(id, data, { new: true });
  }
  
  async deleteContentItem(contentType, id) {
    const Model = this.dynamicModels[contentType];
    if (!Model) throw new Error('Content type not found');
    
    return Model.findByIdAndDelete(id);
  }
  
  async queryContent(contentType, query = {}, options = {}) {
    const Model = this.dynamicModels[contentType];
    if (!Model) throw new Error('Content type not found');
    
    return Model.find(query)
      .sort(options.sort || { createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 100)
      .populate('createdBy');
  }
  
  async initialize() {
    const contentTypes = await ContentType.find();
    contentTypes.forEach(ct => this.registerModel(ct));
  }
}

module.exports = new ContentService();