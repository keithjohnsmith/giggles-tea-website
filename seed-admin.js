const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');

// Get the current directory
const __dirname = path.resolve();

// MongoDB connection URI
const uri = 'mongodb+srv://Giggles:giggles123@clustergigglestea.klqy0jt.mongodb.net/';
const dbName = 'giggles-tea';
const collectionName = 'users';

async function seedAdminUser() {
    const client = new MongoClient(uri);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Check if admin user already exists
        const existingAdmin = await collection.findOne({ email: 'admin@gigglestea.com' });
        
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
        const result = await collection.insertOne(adminUser);
        console.log(`Successfully created admin user with ID: ${result.insertedId}`);
        
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Run the seed
seedAdmin();
