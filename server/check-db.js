const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected');
    
    // Check if products collection exists and has documents
    const collections = await mongoose.connection.db.listCollections().toArray();
    const productCollection = collections.find(c => c.name === 'products');
    
    if (productCollection) {
      console.log('✅ Products collection exists');
      
      const Product = require('./models/Product');
      const count = await Product.countDocuments();
      console.log(`📊 Found ${count} products in the database`);
      
      if (count > 0) {
        const sample = await Product.findOne();
        console.log('📝 Sample product:', {
          name: sample.name,
          price: sample.price,
          category: sample.category
        });
      }
    } else {
      console.log('❌ Products collection does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
