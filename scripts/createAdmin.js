import bcrypt from 'bcryptjs';
import { connectDB } from '../server/config/db.js';

async function createAdminUser() {
    try {
        const db = await connectDB();
        const usersCollection = db.collection('users');
        
        // Check if admin user already exists
        const existingAdmin = await usersCollection.findOne({ email: 'admin@gigglestea.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            process.exit(0);
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
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the function
createAdmin();
