import BaseModel from './BaseModel';
import React from 'react';

class Product extends BaseModel {
  constructor() {
    super('products');
  }

  async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ 'category._id': 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ 'inventory.quantity': 1 });
    await collection.createIndex({ isFeatured: 1 });
    await collection.createIndex({ tags: 1 });
  }

  async findBySlug(slug) {
    return this.findOne({ slug });
  }

  async findByCategory(categoryId) {
    return this.find({ 'category._id': categoryId });
  }

  async search(query) {
    const collection = await this.getCollection();
    return collection.aggregate([
      {
        $search: {
          index: 'product_search',
          text: {
            query: query,
            path: ['name', 'description', 'tags'],
            fuzzy: {}
          }
        }
      },
      { $limit: 50 }
    ]).toArray();
  }

  async updateStock(productId, variantId, quantityChange) {
    const collection = await this.getCollection();
    
    // If variantId is provided, update variant stock
    if (variantId) {
      return collection.updateOne(
        { _id: productId, 'variants._id': variantId },
        { $inc: { 'variants.$.inventory.quantity': quantityChange } }
      );
    }
    
    // Otherwise update main product stock
    return collection.updateOne(
      { _id: productId },
      { $inc: { 'inventory.quantity': quantityChange } }
    );
  }
}

export default new Product();
