const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read the CSV file
const csvFilePath = path.join(__dirname, '..', 'products.csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'products.json');

// Function to process a single product row
function processProduct(row) {
  // Extract all image paths, filtering out empty ones
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

  // Get all non-empty image paths and prefix with src/assets/
  const images = imageFields
    .map(field => (row[field] || '').trim())
    .filter(Boolean)
    .map(path => `src/assets/${path}`);

  // Extract category information (format: "German Category / English Category")
  const [germanCategory = '', englishCategory = ''] = (row.Category || '').split('/').map(c => c.trim());

  return {
    id: row.Code,
    code: row.Code,
    name: row['English Name'],
    germanName: row['German Name'],
    category: englishCategory || 'Other',
    category_de: germanCategory || 'Andere',
    price: 0, // Will be set later
    description: '', // Can be added later
    images: images,
    originalData: { ...row } // Keep original data for reference
  };
}

// Main function to process the CSV
aasync function processCsv() {
  try {
    console.log('Reading CSV file...');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    console.log('Parsing CSV...');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Processing ${records.length} products...`);
    const products = records.map(processProduct);

    console.log('Saving to JSON...');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
    
    console.log(`Successfully processed ${products.length} products. Output saved to ${outputPath}`);
  } catch (error) {
    console.error('Error processing CSV:', error);
    process.exit(1);
  }
}

// Run the script
processCsv();
