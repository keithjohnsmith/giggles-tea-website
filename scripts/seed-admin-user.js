const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

async function seedAdminUser() {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://Giggles:giggles123@clustergigglestea.klqy0jt.mongodb.net/');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(process.env.DB_NAME || 'giggles-tea');
        const usersCollection = db.collection('users');
        
        // Check if admin user already exists
        const existingAdmin = await usersCollection.findOne({ email: 'admin@gigglestea.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('giggles123', salt);
        
        // Create admin user
        const adminUser = {
            email: 'admin@gigglestea.com',
            password: hashedPassword,
            role: 'admin',
            name: 'Admin User',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Insert admin user
        const result = await usersCollection.insertOne(adminUser);
        console.log(`✅ Successfully created admin user with ID: ${result.insertedId}`);
        
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Run the seed
seedAdminUser();
