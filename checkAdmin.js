const { MongoClient } = require('mongodb');

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://Giggles:giggles123@clustergigglestea.klqy0jt.mongodb.net/giggles-tea?retryWrites=true&w=majority';

async function checkAdminUser() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('🔌 Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Find admin user
        const adminUser = await usersCollection.findOne({ email: 'admin@gigglestea.com' });
        
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log({
                email: adminUser.email,
                role: adminUser.role,
                name: adminUser.name,
                _id: adminUser._id
            });
        } else {
            console.log('❌ Admin user not found');
        }
        
    } catch (error) {
        console.error('❌ Error checking admin user:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the check
checkAdminUser();
