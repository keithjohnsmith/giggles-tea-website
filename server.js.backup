import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5174', // Your frontend URL
  credentials: true, // This is important for cookies
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  // Skip authentication for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  
  // Get token from cookies or Authorization header
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Define public routes
const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];

// Routes that don't need authentication
app.use('/api/auth', authRoutes);

// Apply authentication middleware to protected routes
app.use((req, res, next) => {
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  authenticateToken(req, res, next);
});

// Protected routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Add headers before the routes are defined
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Connect to MongoDB with detailed logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/giggles-tea?directConnection=true')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
    console.log('Current working directory:', process.cwd());
    
    // Add connection event listeners
    mongoose.connection.on('connecting', () => {
      console.log('Mongoose connecting to MongoDB...');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000, // Increased socket timeout
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000, // Added connection timeout
      maxPoolSize: 10, // Added connection pool size
      // Remove serverApi configuration to avoid APIStrictError
      // serverApi: {
      //   version: '1',
      //   strict: true,
      //   deprecationErrors: true
      // }
    });
    
    console.log('\n=== MongoDB Connection Established ===');
    console.log(`Host: ${connection.connection.host}`);
    console.log(`Port: ${connection.connection.port}`);
    console.log(`Database: ${connection.connection.name}`);
    console.log('MongoDB connection successful!\n');
    
    return connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Connection URI used:', MONGODB_URI.replace(/:([^:]*?)@/, ':***@'));
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');});

// Connect to MongoDB
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Product Model aligned with existing database structure
const productSchema = new mongoose.Schema({
  // Match existing product fields
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['milk-tea', 'fruit-tea', 'cheese-tea', 'signature-tea', 'toppings', 'other']
  },
  image: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Add virtuals when converting to JSON or objects
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for name (to maintain compatibility with frontend)
productSchema.virtual('name').get(function() {
  return this.title;
});

// Add text index for search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text' 
});

// Create the model
const Product = mongoose.model('Product', productSchema);

// Ensure indexes are created
Product.createIndexes()
  .then(() => console.log('Product indexes created/verified'))
  .catch(err => console.error('Error creating indexes:', err));

// Add sample products if none exist
const initializeSampleProducts = async () => {
  console.log('\n=== Initializing Sample Products ===');
  
  try {
    // Check if products collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'products' }).toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    const count = await Product.countDocuments();
    console.log(`Found ${count} existing products`);
    
    if (count === 0) {
      console.log('No products found. Adding sample products...');
      
      const sampleProducts = [
        {
          name: 'Classic Milk Tea',
          description: 'Our signature black tea with fresh milk and sweetener',
          price: 5.99,
          image: 'https://images.unsplash.com/photo-1568649929103-28ff82a69066?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          category: 'milk-tea',
          featured: true,
          inStock: true
        },
        {
          name: 'Taro Milk Tea',
          description: 'Creamy taro flavor with fresh milk and chewy tapioca pearls',
          price: 6.49,
          image: 'https://images.unsplash.com/photo-1596306498822-1dbb6d6a227f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          category: 'milk-tea',
          featured: true,
          inStock: true
        },
        {
          name: 'Mango Green Tea',
          description: 'Refreshing green tea with fresh mango puree',
          price: 5.99,
          image: '/images/matcha-latte.jpg',
          category: 'specialty',
          featured: true
        },
        {
          name: 'Brown Sugar Boba',
          description: 'Brown sugar milk with boba pearls',
          price: 5.99,
          image: '/images/brown-sugar.jpg',
          category: 'specialty',
          featured: true
        }
      ];
      await Product.insertMany(sampleProducts);
      console.log('Added sample products');
    }
  } catch (error) {
    console.error('Error initializing sample products:', error);
  }
};

// Initialize sample products when server starts
const initializeApp = async () => {
  try {
    // Ensure indexes
    await Product.init();
    console.log('Product indexes ensured');
    
    // Initialize sample data
    await initializeSampleProducts();
    
    // Verify products collection
    const collections = await mongoose.connection.db.listCollections({ name: 'products' }).toArray();
    if (collections.length === 0) {
      console.error('Products collection does not exist!');
    } else {
      console.log('Products collection exists');
      const count = await Product.countDocuments();
      console.log(`Found ${count} products in the database`);
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
};

initializeApp();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Import User model
import User from './models/User.js';

// Create a test user if it doesn't exist
async function createTestUser() {
  try {
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      await User.create({
        username: 'testadmin',
        email: 'test@example.com',
        password: 'password123', // This will be hashed by the pre-save hook
        role: 'admin'
      });
      console.log('Test admin user created');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Call the function to create test user
createTestUser();
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Auth Routes
// Auth Routes - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // In a real app, compare hashed passwords
    const isPasswordValid = password === user.password; // This is just for testing
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;
    
    res.json({ user: userData });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/me', (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  User.findById(req.userId, { password: 0 })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    });
});

// Registration (disabled for now)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user data without sensitive info
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

// Protected route example
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Products route with pagination and detailed logging
app.get('/api/products', async (req, res) => {
  console.log('\n=== /api/products Request ===');
  console.log('Query params:', req.query);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // Number of items per page
    const skip = (page - 1) * limit;
    const category = req.query.category;

    console.log(`Fetching products - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Category: ${category || 'all'}`);
    
    // Build query
    const query = {};
    if (category && ['milk-tea', 'fruit-tea', 'cheese-tea', 'signature-tea', 'toppings', 'other'].includes(category)) {
      query.category = category;
    }

    // Get products with error handling
    let products = [];
    try {
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }) // Include virtuals
        .exec();
      
      console.log(`Found ${products.length} products`);
      
      // Ensure consistent response format
      products = products.map(product => ({
        id: product._id,
        name: product.name, // Uses the virtual getter
        title: product.title,
        description: product.description || '',
        price: product.price,
        image: product.image || '/images/placeholder-tea.jpg',
        category: product.category,
        featured: product.featured || false,
        inStock: product.inStock !== false, // Default to true if not set
        createdAt: product.createdAt
      }));
      
    } catch (findError) {
      console.error('Error in Product.find():', findError);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching products', 
        error: findError.message,
        stack: process.env.NODE_ENV === 'development' ? findError.stack : undefined
      });
    }

    // Get total count
    let total = 0;
    try {
      total = await Product.countDocuments(query);
      console.log(`Total matching products: ${total}`);
    } catch (countError) {
      console.error('Error in countDocuments():', countError);
      // Continue with 0 if count fails
    }

    const pages = Math.ceil(total / limit) || 1;
    const response = {
      success: true,
      data: {
        products,
        pagination: {
          page,
          pages,
          total,
          hasNextPage: page < pages,
          hasPreviousPage: page > 1
        }
      }
    };

    console.log(`Sending ${products.length} products (page ${page} of ${pages})`);
    res.json(response);
    
  } catch (error) {
    console.error('Unhandled error in /api/products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const productsCount = await Product.countDocuments();
    
    res.json({
      status: 'ok',
      database: dbStatus,
      productsCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Start server with enhanced logging
console.log('\n=== Starting Server ===');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Current directory: ${process.cwd()}`);

// Error handling for server startup
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=== Server Started Successfully ===');
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Products API: http://localhost:${PORT}/api/products`);
    console.log('==================================\n');
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider whether to exit the process in production
    // process.exit(1);
  });

  // Handle uncaught exceptions
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Consider whether to exit the process in production
    // process.exit(1);
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('Failed to start server:', error);
  if (error.syscall === 'listen') {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else if (error.code === 'EACCES') {
      console.error(`Port ${PORT} requires elevated privileges`);
    }
  }
  process.exit(1);
}
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
