import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for remote connections
      connectTimeoutMS: 10000, // Added connection timeout
      socketTimeoutMS: 45000, // Added socket timeout
    });
    console.log(`MongoDB Connected to: ${MONGODB_URI.split('@').pop() || MONGODB_URI}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Connection URI used:', MONGODB_URI.split('@')[0] + '@[HIDDEN]');
    return false;
  }
};

// Handle graceful shutdown
const handleShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

// Start the server
const startServer = async () => {
  try {
    // First connect to MongoDB
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    // Then start the Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`MongoDB connected to: ${MONGODB_URI.split('@').pop() || MONGODB_URI}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      console.error('UNHANDLED REJECTION! 💥');
      console.error('Reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('UNCAUGHT EXCEPTION! 💥');
      console.error(error);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer().catch(error => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});

export default app;
