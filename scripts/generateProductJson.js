const fs = require('fs');
const path = require('path');

// The CSV data provided by the user
const csvData = `Code,English Name,German Name,Category,Loose Leaf Path,Tea Box - Main,Tea Box - German,Tea Box - English,Tea Box - Other Sizes/Views 1,Tea Box - Other Sizes/Views 2,Tea Box - Other Sizes/Views 3,Tea Box - Other Sizes/Views 4,Tea Bag - Individual 1,Tea Bag - Individual 2,Tea Bag - Individual 3,Tea Bag - Individual 4,Tea Bag - With Box 1,Tea Bag - With Box 2,Tea Bags - Pyramid Aesthetic,Tea Bags - Clear Packaging 1,Tea Bags - Clear Packaging 2,Aesthetic/Postcard Image 1,Aesthetic/Postcard Image 2
21045,The Emperor's 7 Treasures,Des Kaisers 7 Kostbarkeiten,Schwarzer Tee / Black Tea,Tea Catalogue/21045/22855.jpg,Tea Catalogue/21045/21045.jpg,Tea Catalogue/21045/22855-DE.jpg,Tea Catalogue/21045/22855-EN.jpg,Tea Catalogue/21045/21045-G350.jpg,,,,Tea Catalogue/21045/21045-PKBL_7Kost.jpg,Tea Catalogue/21045/21045-G50_7Kostb.jpg,,,Tea Catalogue/21045/21045-G50.jpg,Tea Catalogue/21045/Pyramiden_G50.jpg,Tea Catalogue/21045/Pyramiden_G50.jpg,Tea Catalogue/21045/21045_Schachtel.jpg,,Tea Catalogue/21045/Teepostkarten_2.jpg,Tea Catalogue/21045/Teepostkarten_3.jpg`;

// Parse CSV data
const parseCsv = (csvString) => {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    
    const product = {};
    headers.forEach((header, index) => {
      product[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    return product;
  });
};

// Process products into desired format
const processProducts = (products) => {
  return products.map(product => {
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
      .map(field => (product[field] || '').trim())
      .filter(Boolean)
      .map(path => `src/assets/${path}`);

    // Extract category information (format: "German Category / English Category")
    const [germanCategory = '', englishCategory = ''] = (product.Category || '').split('/').map(c => c.trim());

    // Set default price based on category
    const getDefaultPrice = (category) => {
      const lowerCategory = (category || '').toLowerCase();
      if (lowerCategory.includes('ayurveda')) return 7.99;
      if (lowerCategory.includes('rooibos')) return 6.99;
      if (lowerCategory.includes('green') || lowerCategory.includes('grüner')) return 8.99;
      if (lowerCategory.includes('black') || lowerCategory.includes('schwarzer')) return 7.99;
      if (lowerCategory.includes('herbal') || lowerCategory.includes('kräuter')) return 5.99;
      if (lowerCategory.includes('fruit') || lowerCategory.includes('früchte')) return 5.99;
      if (lowerCategory.includes('oolong')) return 9.99;
      return 6.99; // Default price
    };

    return {
      id: product.Code,
      code: product.Code,
      name: product['English Name'],
      germanName: product['German Name'],
      category: englishCategory || 'Other',
      category_de: germanCategory || 'Andere',
      price: getDefaultPrice(englishCategory || germanCategory),
      description: '', // Can be added later
      images,
      originalData: { ...product } // Keep original data for reference
    };
  });
};

// Main function to generate the JSON file
const generateProductJson = () => {
  try {
    console.log('Parsing CSV data...');
    const products = parseCsv(csvData);
    console.log(`Parsed ${products.length} products`);
    
    console.log('Processing products...');
    const processedProducts = processProducts(products);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'products.json');
    
    console.log('Writing to JSON file...');
    fs.writeFileSync(outputPath, JSON.stringify(processedProducts, null, 2));
    
    console.log(`Successfully generated ${outputPath}`);
    console.log('\nNote: Please add the remaining CSV data to the csvData variable in this script.');
    
  } catch (error) {
    console.error('Error generating product JSON:', error);
    process.exit(1);
  }
};

// Run the script
generateProductJson();
