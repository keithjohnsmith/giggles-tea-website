const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('FATAL ERROR: MONGO_URI is not defined in environment variables');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected to: ${process.env.MONGO_URI.split('@').pop() || process.env.MONGO_URI}`);
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Connection URI used:', process.env.MONGO_URI ? 
      process.env.MONGO_URI.split('@')[0] + '@[HIDDEN]' : 'Not defined');
    return false;
  }
};

module.exports = connectDB;
