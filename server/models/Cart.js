const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  qty: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [cartItemSchema],
  totalQty: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalQty = this.items.reduce((total, item) => total + item.qty, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.qty), 0);
  this.updatedAt = Date.now();
  next();
});

// Add item to cart
cartSchema.methods.addItem = async function(productId, qty = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }

  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    // Update quantity if item exists
    this.items[itemIndex].qty += qty;
  } else {
    // Add new item
    this.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: qty
    });
  }

  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }

  return this;
};

// Update item quantity
cartSchema.methods.updateItemQty = function(productId, qty) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (item) {
    item.qty = qty;
    return this.save();
  }

  return this;
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
