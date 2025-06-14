import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';

// Configure environment variables
dotenv.config();

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Sample data
const categories = [
  {
    _id: new ObjectId(),
    name: 'Green Tea',
    slug: 'green-tea',
    description: 'Fresh and healthy green tea varieties',
    isActive: true
  },
  {
    _id: new ObjectId(),
    name: 'Black Tea',
    slug: 'black-tea',
    description: 'Rich and bold black tea selections',
    isActive: true
  },
  {
    _id: new ObjectId(),
    name: 'Herbal Tea',
    slug: 'herbal-tea',
    description: 'Caffeine-free herbal infusions',
    isActive: true
  },
  {
    _id: new ObjectId(),
    name: 'Oolong Tea',
    slug: 'oolong-tea',
    description: 'Partially oxidized tea with rich flavors',
    isActive: true
  },
  {
    _id: new ObjectId(),
    name: 'White Tea',
    slug: 'white-tea',
    description: 'Delicate and minimally processed tea leaves',
    isActive: true
  }
];

const products = [
  // Green Teas
  {
    _id: new ObjectId(),
    sku: 'GT001',
    name: 'Classic Green Tea',
    slug: 'classic-green-tea',
    description: 'A refreshing and light green tea with a delicate flavor profile.',
    price: 12.99,
    compareAtPrice: 15.99,
    costPerItem: 6.50,
    category: {
      _id: categories[0]._id,
      name: categories[0].name,
      slug: categories[0].slug
    },
    status: 'active',
    inventory: {
      manage: true,
      quantity: 100,
      lowStockThreshold: 10,
      allowBackorder: false
    },
    weight: {
      value: 100,
      unit: 'g'
    },
    tags: ['green', 'classic', 'refreshing'],
    isFeatured: true,
    seo: {
      title: 'Classic Green Tea - Premium Loose Leaf Tea',
      description: 'Enjoy our premium classic green tea with its delicate flavor and health benefits.'
    },
    variants: [
      {
        _id: new ObjectId(),
        name: '50g Pack',
        sku: 'GT001-50',
        price: 12.99,
        inventory: {
          quantity: 50,
          manage: true
        },
        weight: {
          value: 50,
          unit: 'g'
        }
      },
      {
        _id: new ObjectId(),
        name: '100g Pack',
        sku: 'GT001-100',
        price: 22.99,
        inventory: {
          quantity: 50,
          manage: true
        },
        weight: {
          value: 100,
          unit: 'g'
        }
      }
    ],
    images: [
      {
        _id: new ObjectId(),
        url: '/images/tea/green-tea-1.jpg',
        altText: 'Classic Green Tea',
        isPrimary: true
      }
    ]
  },
  // Add more sample products...
  {
    _id: new ObjectId(),
    sku: 'BT001',
    name: 'Earl Grey Black Tea',
    slug: 'earl-grey-black-tea',
    description: 'Classic Earl Grey with bergamot oil for a distinctive citrusy aroma.',
    price: 14.99,
    compareAtPrice: 17.99,
    costPerItem: 7.50,
    category: {
      _id: categories[1]._id,
      name: categories[1].name,
      slug: categories[1].slug
    },
    status: 'active',
    inventory: {
      manage: true,
      quantity: 75,
      lowStockThreshold: 10,
      allowBackorder: true
    },
    weight: {
      value: 100,
      unit: 'g'
    },
    tags: ['black', 'earl grey', 'bergamot'],
    isFeatured: true,
    variants: [
      {
        _id: new ObjectId(),
        name: '50g Pack',
        sku: 'BT001-50',
        price: 14.99,
        inventory: {
          quantity: 25,
          manage: true
        },
        weight: {
          value: 50,
          unit: 'g'
        }
      },
      {
        _id: new ObjectId(),
        name: '100g Pack',
        sku: 'BT001-100',
        price: 24.99,
        inventory: {
          quantity: 50,
          manage: true
        },
        weight: {
          value: 100,
          unit: 'g'
        }
      }
    ],
    images: [
      {
        _id: new ObjectId(),
        url: '/images/tea/earl-grey.jpg',
        altText: 'Earl Grey Black Tea',
        isPrimary: true
      }
    ]
  },
  // Add more sample products as needed...
];

// Generate sample users with hashed passwords
async function generateUsers() {
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const userPassword = await bcrypt.hash('user1234', saltRounds);

  return [
    {
      _id: new ObjectId(),
      email: 'admin@giggletea.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      isActive: true,
      isEmailVerified: true,
      roles: ['admin'],
      addresses: [
        {
          _id: new ObjectId(),
          firstName: 'Admin',
          lastName: 'User',
          address1: '123 Tea Street',
          city: 'Tea City',
          state: 'Tea State',
          postalCode: '12345',
          country: 'Tea Land',
          phone: '+1234567890',
          isDefaultBilling: true,
          isDefaultShipping: true
        }
      ]
    },
    {
      _id: new ObjectId(),
      email: 'customer@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1987654321',
      isActive: true,
      isEmailVerified: true,
      roles: ['customer'],
      addresses: [
        {
          _id: new ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          address1: '456 Customer Ave',
          city: 'Tea Town',
          state: 'Tea State',
          postalCode: '54321',
          country: 'Tea Land',
          phone: '+1987654321',
          isDefaultBilling: true,
          isDefaultShipping: true
        }
      ]
    }
  ];
}

// Generate sample orders
function generateOrders(users, products) {
  return [
    {
      _id: new ObjectId(),
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: users[1]._id, // Customer user
      status: 'delivered',
      customer: {
        firstName: users[1].firstName,
        lastName: users[1].lastName,
        email: users[1].email,
        phone: users[1].phone
      },
      shippingAddress: {
        ...users[1].addresses[0]
      },
      billingAddress: {
        ...users[1].addresses[0]
      },
      items: [
        {
          _id: new ObjectId(),
          productId: products[0]._id,
          variantId: products[0].variants[0]._id,
          sku: products[0].variants[0].sku,
          name: products[0].name,
          price: products[0].price,
          quantity: 2,
          totalPrice: products[0].price * 2,
          weight: products[0].weight
        },
        {
          _id: new ObjectId(),
          productId: products[1]._id,
          variantId: products[1].variants[1]._id,
          sku: products[1].variants[1].sku,
          name: products[1].name,
          price: products[1].price,
          quantity: 1,
          totalPrice: products[1].price,
          weight: products[1].weight
        }
      ],
      subtotal: (products[0].price * 2) + products[1].price,
      taxAmount: 3.50,
      shippingAmount: 5.99,
      discountAmount: 2.00,
      totalAmount: (products[0].price * 2) + products[1].price + 3.50 + 5.99 - 2.00,
      payment: {
        status: 'paid',
        method: 'credit_card',
        transactionId: `TXN-${Date.now()}`,
        paymentDate: new Date()
      },
      shipping: {
        method: 'standard',
        trackingNumber: `TRACK-${Date.now()}`,
        carrier: 'Standard Shipping'
      },
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(Date.now() - 86400000 * 3),
          notes: 'Order created'
        },
        {
          status: 'processing',
          timestamp: new Date(Date.now() - 86400000 * 2),
          notes: 'Payment received, preparing for shipment'
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 86400000 * 1.5),
          notes: 'Shipped with tracking'
        },
        {
          status: 'delivered',
          timestamp: new Date(Date.now() - 86400000 * 0.5),
          notes: 'Delivered to customer'
        }
      ],
      notes: {
        customer: 'Please leave at the front door.',
        admin: 'Customer requested contactless delivery.'
      }
    }
  ];
}

// Main seed function
async function seedDatabase() {
  let client;
  
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      db.collection('categories').deleteMany({}),
      db.collection('products').deleteMany({}),
      db.collection('users').deleteMany({}),
      db.collection('orders').deleteMany({}),
      db.collection('inventory_transactions').deleteMany({}),
      db.collection('inventory_levels').deleteMany({})
    ]);
    
    console.log('📝 Inserting categories...');
    await db.collection('categories').insertMany(categories);
    
    console.log('📝 Inserting products...');
    await db.collection('products').insertMany(products);
    
    console.log('👥 Generating users...');
    const users = await generateUsers();
    await db.collection('users').insertMany(users);
    
    console.log('🛍️  Generating orders...');
    const orders = generateOrders(users, products);
    await db.collection('orders').insertMany(orders);
    
    // Create inventory transactions and levels
    console.log('📦 Creating inventory records...');
    const inventoryTransactions = [];
    const inventoryLevels = [];
    
    for (const product of products) {
      // Main product inventory
      inventoryLevels.push({
        productId: product._id,
        locationId: null,
        available: product.inventory.quantity,
        committed: 0,
        incoming: 0,
        updatedAt: new Date()
      });
      
      inventoryTransactions.push({
        productId: product._id,
        type: 'purchase',
        quantity: product.inventory.quantity,
        referenceId: 'SEED_INIT',
        notes: 'Initial stock from seed data',
        createdAt: new Date()
      });
      
      // Variant inventory
      for (const variant of product.variants || []) {
        inventoryLevels.push({
          productId: product._id,
          variantId: variant._id,
          locationId: null,
          available: variant.inventory.quantity,
          committed: 0,
          incoming: 0,
          updatedAt: new Date()
        });
        
        inventoryTransactions.push({
          productId: product._id,
          variantId: variant._id,
          type: 'purchase',
          quantity: variant.inventory.quantity,
          referenceId: 'SEED_INIT',
          notes: 'Initial variant stock from seed data',
          createdAt: new Date()
        });
      }
    }
    
    await db.collection('inventory_levels').insertMany(inventoryLevels);
    await db.collection('inventory_transactions').insertMany(inventoryTransactions);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true, sparse: true });
    await db.collection('products').createIndex({ 'category._id': 1 });
    await db.collection('products').createIndex({ status: 1 });
    await db.collection('products').createIndex({ 'inventory.quantity': 1 });
    await db.collection('products').createIndex({ isFeatured: 1 });
    await db.collection('products').createIndex({ tags: 1 });
    
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ 'customer.email': 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ 'payment.transactionId': 1 }, { sparse: true });
    
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ 'addresses.isDefaultShipping': 1 });
    await db.collection('users').createIndex({ 'addresses.isDefaultBilling': 1 });
    await db.collection('users').createIndex({ roles: 1 });
    
    await db.collection('inventory_levels').createIndex(
      { productId: 1, variantId: 1, locationId: 1 },
      { unique: true, sparse: true }
    );
    
    await db.collection('inventory_transactions').createIndex({ productId: 1 });
    await db.collection('inventory_transactions').createIndex({ variantId: 1 });
    await db.collection('inventory_transactions').createIndex({ type: 1 });
    await db.collection('inventory_transactions').createIndex({ createdAt: -1 });
    
    console.log('✅ Database seeded successfully!');
    console.log('\n👤 Admin Login:');
    console.log('   Email: admin@giggletea.com');
    console.log('   Password: admin123');
    console.log('\n👤 Customer Login:');
    console.log('   Email: customer@example.com');
    console.log('   Password: user1234');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the seed function
seedDatabase();
