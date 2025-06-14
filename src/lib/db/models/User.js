import { ObjectId } from 'mongodb';
import BaseModel from './BaseModel';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ 'addresses.isDefaultShipping': 1 });
    await collection.createIndex({ 'addresses.isDefaultBilling': 1 });
    await collection.createIndex({ roles: 1 });
  }

  async createUser(userData) {
    const { password, ...userDataWithoutPassword } = userData;
    
    // Hash password if provided
    const hashedPassword = password ? await this.hashPassword(password) : undefined;
    
    const user = {
      ...userDataWithoutPassword,
      ...(hashedPassword && { password: hashedPassword }),
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userId = await this.create(user);
    return { ...user, _id: userId };
  }

  async updateUser(userId, updateData) {
    const { password, ...updateDataWithoutPassword } = updateData;
    const update = { ...updateDataWithoutPassword, updatedAt: new Date() };
    
    // If password is being updated, hash it
    if (password) {
      update.password = await this.hashPassword(password);
    }
    
    return this.updateOne({ _id: userId }, { $set: update });
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  async verifyPassword(user, password) {
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async addAddress(userId, addressData) {
    const address = {
      _id: new ObjectId(),
      ...addressData,
      isDefaultBilling: !!addressData.isDefaultBilling,
      isDefaultShipping: !!addressData.isDefaultShipping,
      createdAt: new Date()
    };

    // If this is set as default, unset default for other addresses
    const update = { $push: { addresses: address } };
    
    if (address.isDefaultBilling) {
      update.$set = {
        'addresses.$[].isDefaultBilling': false,
        ...update.$set
      };
    }
    
    if (address.isDefaultShipping) {
      update.$set = {
        'addresses.$[].isDefaultShipping': false,
        ...update.$set
      };
    }

    await this.updateOne({ _id: userId }, update);
    return address;
  }

  async updateAddress(userId, addressId, updateData) {
    const address = await this.findOne({
      _id: userId,
      'addresses._id': new ObjectId(addressId)
    });
    
    if (!address) return null;

    const update = { $set: {} };
    
    // Update address fields
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'isDefaultBilling' && key !== 'isDefaultShipping') {
        update.$set[`addresses.$.${key}`] = value;
      }
    });
    
    // Handle default billing/shipping flags
    if (updateData.isDefaultBilling !== undefined) {
      if (updateData.isDefaultBilling) {
        // Set all addresses' isDefaultBilling to false first
        await this.updateOne(
          { _id: userId },
          { $set: { 'addresses.$[].isDefaultBilling': false } }
        );
      }
      update.$set['addresses.$.isDefaultBilling'] = updateData.isDefaultBilling;
    }
    
    if (updateData.isDefaultShipping !== undefined) {
      if (updateData.isDefaultShipping) {
        // Set all addresses' isDefaultShipping to false first
        await this.updateOne(
          { _id: userId },
          { $set: { 'addresses.$[].isDefaultShipping': false } }
        );
      }
      update.$set['addresses.$.isDefaultShipping'] = updateData.isDefaultShipping;
    }
    
    update.$set['addresses.$.updatedAt'] = new Date();
    
    await this.updateOne(
      { _id: userId, 'addresses._id': new ObjectId(addressId) },
      update
    );
    
    return this.findById(userId);
  }
}

export default new User();
