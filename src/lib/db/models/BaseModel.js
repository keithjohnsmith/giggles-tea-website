import clientPromise from '../connect';
import React from 'react';

class BaseModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collection = null;
  }

  async getCollection() {
    if (!this.collection) {
      const client = await clientPromise;
      const db = client.db(); // Gets the default database from the connection string
      this.collection = db.collection(this.collectionName);
    }
    return this.collection;
  }

  async createIndexes() {
    // To be implemented by child classes
  }

  async create(data) {
    const collection = await this.getCollection();
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId;
  }

  async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: id });
  }

  async findOne(query) {
    const collection = await this.getCollection();
    return collection.findOne(query);
  }

  async find(query = {}, options = {}) {
    const { 
      sort = { createdAt: -1 },
      limit = 100,
      skip = 0,
      projection = {}
    } = options;

    const collection = await this.getCollection();
    let cursor = collection.find(query, { projection });
    
    if (sort) cursor = cursor.sort(sort);
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);
    
    return cursor.toArray();
  }

  async updateOne(filter, update, options = {}) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      filter,
      { 
        $set: { 
          ...update,
          updatedAt: new Date() 
        } 
      },
      options
    );
    return result;
  }

  async deleteOne(filter) {
    const collection = await this.getCollection();
    return collection.deleteOne(filter);
  }

  async countDocuments(query = {}) {
    const collection = await this.getCollection();
    return collection.countDocuments(query);
  }
}

export default BaseModel;
