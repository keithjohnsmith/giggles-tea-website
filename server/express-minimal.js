const express = require('express');

// Create Express app
const app = express();
const PORT = 5003; // Different port to avoid conflicts

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.status(200).json({
    status: 'success',
    message: 'Express test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit!');
  res.status(200).json({
    status: 'success',
    message: 'Express server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== Express Minimal Server ===`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Time: ${new Date().toISOString()}`);
  console.log('\n=== Available Endpoints ===');
  console.log(`  GET  /test`);
  console.log(`  GET  /api/health`);
  console.log('\n=== Test with: ===');
  console.log(`  curl http://localhost:${PORT}/api/health`);
  console.log('==================\n');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to exit the process here
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider whether to exit the process here
  // process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
