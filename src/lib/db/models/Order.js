import BaseModel from './BaseModel';

class Order extends BaseModel {
  constructor() {
    super('orders');
  }

  async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ orderNumber: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ 'customer.email': 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ 'payment.transactionId': 1 }, { sparse: true });
  }

  async createOrder(orderData) {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending',
      payment: {
        status: 'unpaid',
        ...orderData.payment
      },
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order created'
      }]
    };

    const orderId = await this.create(order);
    return { ...order, _id: orderId };
  }

  async updateStatus(orderId, newStatus, notes = '') {
    const update = {
      $set: { status: newStatus },
      $push: {
        statusHistory: {
          status: newStatus,
          timestamp: new Date(),
          notes
        }
      }
    };

    return this.updateOne({ _id: orderId }, update);
  }

  async findByUser(userId, options = {}) {
    return this.find({ userId }, { ...options, sort: { createdAt: -1 } });
  }

  async getOrderSummary() {
    const collection = await this.getCollection();
    return collection.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          byStatus: { $push: { status: "$status", amount: "$totalAmount" } }
        }
      },
      {
        $unwind: "$byStatus"
      },
      {
        $group: {
          _id: "$byStatus.status",
          totalOrders: { $first: "$totalOrders" },
          totalRevenue: { $first: "$totalRevenue" },
          avgOrderValue: { $first: "$avgOrderValue" },
          count: { $sum: 1 },
          amount: { $sum: "$byStatus.amount" }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          amount: 1,
          percentage: { $multiply: [{ $divide: ["$count", "$totalOrders"] }, 100] },
          totalOrders: 1,
          totalRevenue: 1,
          avgOrderValue: 1
        }
      },
      { $sort: { status: 1 } }
    ]).toArray();
  }
}

export default new Order();
