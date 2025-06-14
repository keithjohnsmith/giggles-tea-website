const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Review = require('./models/Review');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/giggles-tea');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Connect to the database before running the seed script
connectDB();

// Import data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isAdmin: true
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    username: 'barista',
    email: 'barista@example.com',
    password: 'barista123',
    role: 'admin',
    isAdmin: false
  }
];

// Define categories with their IDs matching the enum in Product model
const categories = [
  // Tea Bag Mixbox
  {
    name: 'tea-bag-mixbox',
    displayName: 'Tea Bag Mixbox',
    slug: 'tea-bag-mixbox',
    description: 'Carefully curated tea bag assortments for every taste',
    featured: true,
    image: '/assets/1704.jpg'
  },
  
  // Green Tea
  {
    name: 'green-tea',
    displayName: 'Green Tea',
    slug: 'green-tea',
    description: 'Fresh and aromatic green teas from around the world',
    featured: true,
    image: '/assets/21042.jpg'
  },
  
  // Black Tea
  {
    name: 'black-tea',
    displayName: 'Black Tea',
    slug: 'black-tea',
    description: 'Rich and bold black teas for every occasion',
    featured: true,
    image: '/assets/21041.jpg'
  },
  
  // Black Tea Blend
  {
    name: 'black-tea-blend',
    displayName: 'Black Tea Blends',
    slug: 'black-tea-blend',
    description: 'Artfully blended black teas with unique flavors',
    featured: true,
    image: '/assets/21170.jpg'
  },
  
  // Rooibos Tea
  {
    name: 'rooibos-tea',
    displayName: 'Rooibos Tea',
    slug: 'rooibos-tea',
    description: 'Naturally sweet and caffeine-free South African rooibos',
    featured: true,
    image: '/assets/21047.jpg'
  },
  
  // Fruit Tea Blend
  {
    name: 'fruit-tea-blend',
    displayName: 'Fruit Tea Blends',
    slug: 'fruit-tea-blend',
    description: 'Vibrant and flavorful fruit infusions',
    featured: true,
    image: '/assets/21048.jpg'
  },
  
  // Half Fermented Tea
  {
    name: 'half-fermented-tea',
    displayName: 'Oolong Tea',
    slug: 'half-fermented-tea',
    description: 'Partially oxidized teas with complex flavors',
    featured: true,
    image: '/assets/21287.jpg'
  },
  
  // Herb Tea Blend
  {
    name: 'herb-tea-blend',
    displayName: 'Herbal Tea Blends',
    slug: 'herb-tea-blend',
    description: 'Soothing and aromatic herbal infusions',
    featured: true,
    image: '/assets/21160.jpg'
  },
  
  // Herb Tea
  {
    name: 'herb-tea',
    displayName: 'Single Herb Teas',
    slug: 'herb-tea',
    description: 'Pure and simple herbal teas',
    featured: true,
    image: '/assets/21163.jpg'
  }
];

const products = [
  {
    name: 'Tea Bag Mixbox No 1 - Fruit and Classic',
    description: 'A delightful mix of fruity and classic tea bag varieties',
    price: 12.99,
    category: 'tea-bag-mixbox-fruit-classic',
    image: '/assets/1704.jpg',
    countInStock: 50,
    isFeatured: true,
    rating: 4.8,
    numReviews: 24,
    variants: [
      { sku: 'MIX-1704', size: '20 tea bags', price: 12.99 },
      { sku: 'MIX-1704-50', size: '50 tea bags', price: 24.99 }
    ],
    tags: ['mix', 'assortment', 'variety']
  },
  {
    name: 'Tea Bag Mixbox No 2 - Fruit and Exotic',
    description: 'Exotic fruit tea bag assortment with unique flavor combinations',
    price: 12.99,
    category: 'tea-bag-mixbox-fruit-exotic',
    image: '/assets/1705.jpg',
    countInStock: 45,
    isFeatured: true,
    rating: 4.7,
    numReviews: 18,
    variants: [
      { sku: 'MIX-1705', size: '20 tea bags', price: 12.99 },
      { sku: 'MIX-1705-50', size: '50 tea bags', price: 24.99 }
    ],
    tags: ['mix', 'exotic', 'fruity']
  },
  
  // Green Tea
  {
    name: 'Green Tea Japan Sencha Fukujyu',
    description: 'Premium Japanese Sencha green tea with a fresh, grassy flavor',
    price: 14.99,
    category: 'green-tea-japan-sencha',
    image: '/assets/21042.jpg',
    countInStock: 65,
    isFeatured: true,
    rating: 4.8,
    numReviews: 32,
    variants: [
      { sku: 'GT-21042-50', size: '50g', price: 14.99 },
      { sku: 'GT-21042-150', size: '150g', price: 34.99 }
    ],
    origin: 'Japan',
    caffeine: 'Medium',
    ingredients: 'Green tea leaves',
    brewTime: '2-3 minutes',
    temperature: '80°C / 176°F',
    tags: ['japanese', 'sencha', 'grassy']
  },
  {
    name: 'Green Tea Sencha Lemon',
    description: 'Refreshing Japanese Sencha with natural lemon flavor',
    price: 13.99,
    category: 'green-tea-sencha-lemon',
    image: '/assets/21043.jpg',
    countInStock: 58,
    isFeatured: true,
    rating: 4.6,
    numReviews: 28,
    variants: [
      { sku: 'GT-21043-50', size: '50g', price: 13.99 },
      { sku: 'GT-21043-100', size: '100g', price: 24.99 }
    ],
    origin: 'Japan',
    caffeine: 'Medium',
    ingredients: 'Green tea, natural lemon flavor',
    brewTime: '2-3 minutes',
    temperature: '80°C / 176°F',
    tags: ['citrus', 'refreshing', 'lemon']
  },
  
  // Black Tea
  {
    name: 'Black Tea Earl Grey',
    description: 'Classic black tea with the distinctive flavor of bergamot',
    price: 12.99,
    category: 'black-tea-earl-grey',
    image: '/assets/21063.jpg',
    countInStock: 75,
    isFeatured: true,
    rating: 4.7,
    numReviews: 42,
    variants: [
      { sku: 'BT-21063-50', size: '50g', price: 12.99 },
      { sku: 'BT-21063-150', size: '150g', price: 29.99 }
    ],
    origin: 'Blend',
    caffeine: 'High',
    ingredients: 'Black tea, natural bergamot flavor',
    brewTime: '3-5 minutes',
    temperature: '95°C / 203°F',
    tags: ['classic', 'bergamot', 'aromatic']
  },
  {
    name: 'Black Tea English Breakfast',
    description: 'Robust and full-bodied blend perfect for starting your day',
    price: 11.99,
    category: 'black-tea-english-breakfast',
    image: '/assets/21041.jpg',
    countInStock: 82,
    isFeatured: true,
    rating: 4.6,
    numReviews: 36,
    variants: [
      { sku: 'BT-21041-50', size: '50g', price: 11.99 },
      { sku: 'BT-21041-150', size: '150g', price: 27.99 }
    ],
    origin: 'Blend',
    caffeine: 'High',
    ingredients: 'Assam, Ceylon, and Kenyan black teas',
    brewTime: '3-5 minutes',
    temperature: '95°C / 203°F',
    tags: ['breakfast', 'bold', 'energizing']
  },
  
  // Black Tea Blend
  {
    name: 'Black Tea Blend Orange Cookies',
    description: 'Aromatic black tea with sweet orange and vanilla cookie notes',
    price: 13.99,
    category: 'black-tea-blend-orange-cookies',
    image: '/assets/21170.jpg',
    countInStock: 45,
    isFeatured: true,
    rating: 4.8,
    numReviews: 29,
    variants: [
      { sku: 'BTB-21170-50', size: '50g', price: 13.99 },
      { sku: 'BTB-21170-100', size: '100g', price: 24.99 }
    ],
    origin: 'Blend',
    caffeine: 'Medium',
    ingredients: 'Black tea, orange peel, flavoring, vanilla pieces',
    brewTime: '3-4 minutes',
    temperature: '95°C / 203°F',
    tags: ['sweet', 'dessert', 'orange']
  },
  
  // Rooibos Tea
  {
    name: 'Rooibos Tea Blend Bush Fire',
    description: 'Spicy rooibos blend with cinnamon and orange',
    price: 10.99,
    category: 'rooibos-tea-blend-bush-fire',
    image: '/assets/21047.jpg',
    countInStock: 55,
    isFeatured: true,
    rating: 4.5,
    numReviews: 21,
    variants: [
      { sku: 'RB-21047-50', size: '50g', price: 10.99 },
      { sku: 'RB-21047-100', size: '100g', price: 18.99 }
    ],
    origin: 'South Africa',
    caffeine: 'None',
    ingredients: 'Rooibos, cinnamon, orange peel, flavoring',
    brewTime: '5-7 minutes',
    temperature: '95°C / 203°F',
    tags: ['caffeine-free', 'spicy', 'sweet']
  },
  
  // Fruit Tea Blend
  {
    name: 'Fruit Tea Blend Grandma\'s Garden',
    description: 'A nostalgic blend of fruits and berries',
    price: 9.99,
    category: 'fruit-tea-blend-grandmas-garden',
    image: '/assets/21048.jpg',
    countInStock: 68,
    isFeatured: true,
    rating: 4.6,
    numReviews: 34,
    variants: [
      { sku: 'FTB-21048-50', size: '50g', price: 9.99 },
      { sku: 'FTB-21048-100', size: '100g', price: 16.99 }
    ],
    origin: 'Blend',
    caffeine: 'None',
    ingredients: 'Hibiscus, apple pieces, rosehip peel, flavoring',
    brewTime: '5-7 minutes',
    temperature: '95°C / 203°F',
    tags: ['fruity', 'berry', 'sweet']
  },
  
  // Half Fermented Tea
  {
    name: 'Half Fermented Tea - Milky Oolong',
    description: 'Creamy oolong with a smooth, buttery finish',
    price: 16.99,
    category: 'half-fermented-tea-milky-oolong',
    image: '/assets/21287.jpg',
    countInStock: 32,
    isFeatured: true,
    rating: 4.9,
    numReviews: 27,
    variants: [
      { sku: 'OOL-21287-50', size: '50g', price: 16.99 },
      { sku: 'OOL-21287-100', size: '100g', price: 29.99 }
    ],
    origin: 'Taiwan',
    caffeine: 'Medium',
    ingredients: 'Oolong tea',
    brewTime: '3-4 minutes',
    temperature: '90°C / 194°F',
    tags: ['creamy', 'buttery', 'smooth']
  },
  
  // Herb Tea Blend
  {
    name: 'Herb Tea Blend Ginger Fresh Tea',
    description: 'Spicy and invigorating ginger infusion',
    price: 8.99,
    category: 'herb-tea-blend-ginger-fresh',
    image: '/assets/21051.jpg',
    countInStock: 72,
    isFeatured: true,
    rating: 4.7,
    numReviews: 39,
    variants: [
      { sku: 'HTB-21051-50', size: '50g', price: 8.99 },
      { sku: 'HTB-21051-100', size: '100g', price: 14.99 }
    ],
    origin: 'Blend',
    caffeine: 'None',
    ingredients: 'Ginger, lemongrass, lemon balm, flavoring',
    brewTime: '5-7 minutes',
    temperature: '95°C / 203°F',
    tags: ['spicy', 'ginger', 'digestive']
  },
  
  // Herb Tea
  {
    name: 'Herb Tea Peppermint',
    description: 'Pure peppermint leaves for a refreshing infusion',
    price: 7.99,
    category: 'herb-tea-peppermint',
    image: '/assets/21163.jpg',
    countInStock: 88,
    isFeatured: true,
    rating: 4.8,
    numReviews: 45,
    variants: [
      { sku: 'HT-21163-50', size: '50g', price: 7.99 },
      { sku: 'HT-21163-100', size: '100g', price: 12.99 }
    ],
    origin: 'Egypt',
    caffeine: 'None',
    ingredients: 'Peppermint leaves',
    brewTime: '5-7 minutes',
    temperature: '95°C / 203°F',
    tags: ['minty', 'refreshing', 'digestive']
  },
  {
    name: 'English Breakfast',
    description: 'Robust and full-bodied blend of premium black teas',
    price: 12.99,
    category: 'black-tea-english-breakfast',
    image: '/images/products/english-breakfast.jpg',
    countInStock: 120,
    isFeatured: true,
    rating: 4.5,
    numReviews: 18,
    origin: 'Blend',
    caffeine: 'High',
    ingredients: 'Assam, Ceylon, and Kenyan black teas',
    brewTime: '3-4 minutes',
    temperature: '95°C / 203°F',
    tags: ['bold', 'breakfast', 'classic']
  },
  {
    name: 'Japanese Sencha',
    description: 'Premium Japanese green tea with a delicate, vegetal flavor',
    price: 16.99,
    category: 'green-tea-japan-sencha',
    image: '/images/products/japanese-sencha.jpg',
    countInStock: 65,
    isFeatured: true,
    rating: 4.8,
    numReviews: 32,
    origin: 'Japan',
    caffeine: 'Medium',
    ingredients: 'Green tea leaves',
    brewTime: '2-3 minutes',
    temperature: '80°C / 176°F',
    tags: ['japanese', 'grassy', 'umami']
  },
  // Herbal Teas
  {
    name: 'Chamomile Dream',
    description: 'Soothing caffeine-free herbal infusion with chamomile flowers',
    price: 10.99,
    category: 'herb-tea-camomile',
    image: '/images/products/chamomile-dream.jpg',
    countInStock: 95,
    isFeatured: true,
    rating: 4.6,
    numReviews: 28,
    origin: 'Egypt',
    caffeine: 'None',
    ingredients: 'Chamomile flowers',
    brewTime: '5-7 minutes',
    temperature: '95°C / 203°F',
    tags: ['caffeine-free', 'relaxing', 'floral']
  },
  // Coffee Beans (Using black tea as a substitute for coffee products)
  {
    name: 'Colombian Supremo',
    description: 'Single-origin Colombian coffee with notes of caramel and citrus',
    price: 15.99,
    category: 'black-tea-assam',
    image: '/images/products/colombian-supremo.jpg',
    countInStock: 75,
    isFeatured: true,
    rating: 4.7,
    numReviews: 36,
    origin: 'Colombia',
    roast: 'Medium',
    process: 'Washed',
    flavorProfile: 'Caramel, citrus, chocolate',
    tags: ['single-origin', 'balanced', 'versatile']
  },
  // Coffee Pods (Using black tea as a substitute for coffee products)
  {
    name: 'Nespresso Compatible Pods - Variety Pack',
    description: 'Assortment of our best-selling coffee blends for Nespresso machines',
    price: 24.99,
    category: 'black-tea-earl-grey',
    image: '/images/products/nespresso-variety-pack.jpg',
    countInStock: 50,
    isFeatured: true,
    rating: 4.5,
    numReviews: 42,
    compatibility: 'Nespresso Original Line',
    includes: ['Colombian', 'Ethiopian', 'Italian Roast', 'Decaf'],
    tags: ['pods', 'variety', 'convenient']
  },
  // Teaware
  {
    name: 'Ceramic Teapot with Infuser',
    description: 'Handcrafted ceramic teapot with removable stainless steel infuser',
    price: 34.99,
    category: 'black-tea-english-breakfast', // Using a valid tea category
    image: '/images/products/ceramic-teapot.jpg',
    countInStock: 25,
    isFeatured: true,
    rating: 4.8,
    numReviews: 15,
    capacity: '32oz',
    material: 'Ceramic, stainless steel',
    tags: ['teapot', 'infuser', 'ceramic']
  },
  // Coffee Equipment
  {
    name: 'French Press - Stainless Steel',
    description: 'Premium double-walled stainless steel French press for rich, full-bodied coffee',
    price: 39.99,
    category: 'black-tea-english-breakfast', // Using a valid tea category
    image: '/images/products/french-press.jpg',
    countInStock: 30,
    isFeatured: true,
    rating: 4.9,
    numReviews: 28,
    capacity: '34oz',
    material: 'Stainless steel, BPA-free plastic',
    tags: ['french press', 'coffee maker', 'stainless']
  },
  // Gift Sets
  {
    name: 'Tea Lover\'s Gift Set',
    description: 'Premium tea sampler with teapot and accessories',
    price: 59.99,
    category: 'black-tea-english-breakfast', // Using a valid tea category
    image: '/images/products/tea-lovers-gift-set.jpg',
    countInStock: 20,
    isFeatured: true,
    rating: 4.9,
    numReviews: 12,
    includes: [
      'Ceramic teapot',
      '3 tea tins',
      'Tea infuser',
      'Honey sticks',
      'Tea sampler (6 varieties)'
    ],
    tags: ['gift', 'set', 'premium']
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});

    console.log('Data cleared');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt)
      }))
    );

    // Create users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Users imported');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories imported');

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log('Products imported');

    console.log('Data import completed successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await User.create({
        ...user,
        password: hashedPassword,
        isVerified: true,
        shippingAddress: {
          address: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'credit_card',
        favorites: []
      });
      createdUsers.push(newUser);
    }
    
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});

    console.log('Data destroyed');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

// Handle database connection and run the appropriate function
const run = async () => {
  try {
    await connectDB();
    
    if (process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error in seed script:', error);
    process.exit(1);
  }
};

// Run the script
run();
