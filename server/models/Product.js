const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be a positive number'],
    },
    image: {
      type: String,
      default: '/images/default-product.jpg',
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      enum: {
        values: [
          // Tea Bag Mixbox
          'tea-bag-mixbox-fruit-classic',
          'tea-bag-mixbox-fruit-exotic',
          'tea-bag-mixbox-herbal-fruit',
          'tea-bag-mixbox-green-fresh',
          'tea-bag-mixbox-black-beauties',
          'tea-bag-mixbox-black-pure',
          'tea-bag-mixbox-pure-clear',
          'tea-bag-mixbox-best-of-xmas',
          
          // Green Tea
          'green-tea-japan-sencha',
          'green-tea-sencha-lemon',
          'green-menthos',
          'green-white-tea-blend',
          'green-tea-sencha-sakura',
          'green-tea-china-jasmine',
          'green-tea-temple-of-heaven',
          
          // Black Tea
          'black-tea-vanilla',
          'black-tea-earl-grey',
          'black-tea-assam',
          'black-tea-east-frisian',
          'black-tea-ceylon',
          'black-tea-margarets-hope',
          'black-tea-english-breakfast',
          
          // Black Tea Blend
          'black-tea-blend-orange-cookies',
          'black-tea-blend-east-frisian-sunday',
          'black-green-tea-blend-emperors-treasures',
          
          // Rooibos Tea
          'rooibos-tea-blend-bush-fire',
          'rooibos-tea-blend-windhuk-vanilla',
          'rooibos-tea-gingerbread-biscuit-orange',
          'rooibos-tea-blend-sweet-sin',
          'rooibos-tea-karamell',
          
          // Fruit Tea Blend
          'fruit-tea-blend-grandmas-garden',
          'fruit-tea-blend-fair-almond',
          'fruit-tea-blend-mango-friends',
          'fruit-tea-blend-sea-buckthorn',
          'fruit-tea-blend-rhubarb-spritzer',
          'fruit-tea-blend-turkish-apple-yogurt-lime',
          'fruit-tea-blend-advent',
          'fruit-tea-blend-cloud-catcher',
          'fruit-tea-blend-bora-bora',
          'fruit-tea-blend-bitter-lemonade',
          'fruit-tea-blend-palais-royal',
          'fruit-tea-blend-old-love',
          'fruit-tea-blend-orange-dream',
          
          // Half Fermented Tea
          'half-fermented-tea-milky-oolong',
          
          // Herb Tea Blend
          'herb-tea-blend-ginger-fresh',
          'herb-tea-blend-cool-mint',
          'herb-tea-blend-orange-grapefruit',
          'herb-tea-blend-bad-weather',
          'herb-tea-blend-kapha',
          'herb-tea-blend-yoga',
          'herb-tea-blend-fennel-aniseed-cumin',
          'herb-tea-blend-womans-tea',
          'herbal-tea-blend-vata',
          'herbal-tea-blend-pitta',
          'herb-tea-peppermint',
          'herb-tea-camomile'
        ],
        message: 'Please select a valid category',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews (to be implemented later)
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Create text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Pre-save hook to format price to 2 decimal places
productSchema.pre('save', function (next) {
  if (this.isModified('price')) {
    this.price = parseFloat(this.price.toFixed(2));
  }
  next();
});

// Static method to get average rating
productSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.model('Review').aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      numReviews: obj[0] ? obj[0].numReviews : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = mongoose.model('Product', productSchema);
