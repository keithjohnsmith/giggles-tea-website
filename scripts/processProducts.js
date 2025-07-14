const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const CSV_FILE = path.join(__dirname, '../products.csv');
const OUTPUT_FILE = path.join(__dirname, '../src/data/processedProducts.json');

// Store processed products
const products = [];

console.log('Processing products from CSV...');

// Read and process the CSV file
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    // Extract all image paths from the product
    const imageFields = [
      'Loose Leaf Path',
      'Tea Box - Main',
      'Tea Box - German',
      'Tea Box - English',
      'Tea Box - Other Sizes/Views 1',
      'Tea Box - Other Sizes/Views 2',
      'Tea Box - Other Sizes/Views 3',
      'Tea Box - Other Sizes/Views 4',
      'Tea Bag - Individual 1',
      'Tea Bag - Individual 2',
      'Tea Bag - Individual 3',
      'Tea Bag - Individual 4',
      'Tea Bag - With Box 1',
      'Tea Bag - With Box 2',
      'Tea Bags - Pyramid Aesthetic',
      'Tea Bags - Clear Packaging 1',
      'Tea Bags - Clear Packaging 2',
      'Aesthetic/Postcard Image 1',
      'Aesthetic/Postcard Image 2'
    ];

    // Get all non-empty image paths
    const images = imageFields
      .map(field => (row[field] || '').trim())
      .filter(Boolean);

    // Extract category information
    const [germanCategory = '', englishCategory = ''] = (row['Category'] || '').split('/').map(c => c.trim());
    
    // Create product object
    const product = {
      id: row['Code'],
      code: row['Code'],
      name: row['English Name'],
      germanName: row['German Name'],
      category: englishCategory || 'Other',
      category_de: germanCategory || 'Andere',
      price: 0, // Will be set later
      description: '', // Can be added later
      images: images,
      originalData: { ...row }
    };

    products.push(product);
  })
  .on('end', () => {
    console.log(`Processed ${products.length} products`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
    console.log(`Products data written to ${OUTPUT_FILE}`);
  })
  .on('error', (error) => {
    console.error('Error processing CSV:', error);
  });
