const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number'],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});


const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: ['stripe', 'paypal', 'cash_on_delivery'],
        message: 'Please select a valid payment method',
      },
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
orderSchema.pre('save', async function (next) {
  // Calculate items price
  this.itemsPrice = this.orderItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  // Calculate shipping price (example: free shipping for orders over $50)
  this.shippingPrice = this.itemsPrice > 50 ? 0 : 10;

  // Calculate tax (example: 10% tax)
  this.taxPrice = parseFloat((this.itemsPrice * 0.1).toFixed(2));

  // Calculate total price
  this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;

  // Round to 2 decimal places
  this.totalPrice = parseFloat(this.totalPrice.toFixed(2));

  next();
});

// Static method to get monthly income
orderSchema.statics.getMonthlyIncome = async function (year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const income = await this.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        sales: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return income;
};

module.exports = mongoose.model('Order', orderSchema);
