console.log('Starting server initialization...');

// Import core modules
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

console.log('Core modules imported successfully');

try {
  // Load environment variables from the root directory
  const envPath = path.join(__dirname, '..', '.env');
  console.log('Loading environment variables from:', envPath);
  require('dotenv').config({ path: envPath });
  
  // Verify required environment variables
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }
  console.log('Environment variables loaded successfully');
} catch (err) {
  console.error('Error during initialization:', err);
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Basic middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',  // Default React port
  'http://localhost:3001',  // Common React port
  'http://localhost:5173',  // Vite default port
  'http://localhost:5174',  // Common Vite port
  'http://localhost:5000',  // Our backend port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.error('CORS error:', msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Important for cookies, authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Log CORS configuration
console.log('Allowed CORS origins:', JSON.stringify(allowedOrigins, null, 2));

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ 
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection Setup
console.log('Setting up MongoDB connection...');

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI.split('@')[0] + '@[HIDDEN]');

// Set up MongoDB event listeners
mongoose.connection.on('connecting', () => {
  console.log('Mongoose connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected');
  console.log(`✅ Connected to MongoDB at: ${process.env.MONGO_URI.split('@').pop()}`);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  if (err.code) console.error('Error code:', err.code);
  if (err.codeName) console.error('Error code name:', err.codeName);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB connection established');
    
    // Start the server only after MongoDB is connected
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Time: ${new Date().toISOString()}`);
      
      // Log all available routes
      console.log('\nAvailable routes:');
      app._router.stack
        .filter(r => r.route)
        .map(r => {
          const method = Object.keys(r.route.methods)[0].toUpperCase();
          console.log(`  ${method.padEnd(6)} ${r.route.path}`);
        });
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
