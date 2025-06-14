import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// MongoDB connection URI - using the same format as in the import script
const MONGODB_URI = 'mongodb+srv://Giggles:giggles123@clustergigglestea.klqy0jt.mongodb.net/giggles-tea?retryWrites=true&w=majority';

async function createAdminUser() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('🔌 Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Check if admin user already exists
        const existingAdmin = await usersCollection.findOne({ email: 'admin@gigglestea.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
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
        console.error('❌ Error creating admin user:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the function
createAdmin();
