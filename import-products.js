import { MongoClient, ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection URI
const uri = 'mongodb+srv://Giggles:giggles123@clustergigglestea.klqy0jt.mongodb.net/';
const dbName = 'giggles-tea';
const collectionName = 'products';

async function importProducts() {
    const client = new MongoClient(uri);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Read the JSON file
        const filePath = path.join(__dirname, 'giggles-tea.products.json');
        const data = await fs.readFile(filePath, 'utf8');
        const products = JSON.parse(data);
        
        // Clean up _id fields (convert string $oid to ObjectId)
        const cleanProducts = products.map(product => {
            if (product._id && product._id.$oid) {
                return { ...product, _id: new ObjectId(product._id.$oid) };
            }
            return product;
        });
        
        // Clear existing collection before import
        await collection.deleteMany({});
        
        // Insert products
        const result = await collection.insertMany(cleanProducts, { ordered: false });
        console.log(`Successfully inserted ${result.insertedCount} products`);
        
    } catch (error) {
        console.error('Error importing products:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Run the import
importProducts();
