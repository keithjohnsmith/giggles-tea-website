const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/giggles-tea');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Product data with categories and images
const productsData = [
  // Tea Bag Mixbox
  { name: 'No 1 Fruit & Classic', category: 'tea-bag-mixbox-fruit-classic', images: ['/assets/1704.jpg', '/assets/1704_1706_1710.jpg'] },
  { name: 'No 2 Fruit & Exotic', category: 'tea-bag-mixbox-fruit-exotic', images: ['/assets/1705.jpg', '/assets/1705_2.jpg'] },
  { name: 'No 3 Herbal & Fruit', category: 'tea-bag-mixbox-herbal-fruit', images: ['/assets/1706.jpg'] },
  { name: 'No 4 Green & Fresh', category: 'tea-bag-mixbox-green-fresh', images: ['/assets/1707.jpg', '/assets/1707_1711_1705.jpg'] },
  { name: 'No 5 Black & Beauties', category: 'tea-bag-mixbox-black-beauties', images: ['/assets/1708.jpg'] },
  { name: 'No 6 Black & Pure', category: 'tea-bag-mixbox-black-pure', images: ['/assets/1710.jpg'] },
  { name: 'No 7 Pure & Clear', category: 'tea-bag-mixbox-pure-clear', images: ['/assets/1711.jpg'] },
  { name: 'No 8 Best of Xmas', category: 'tea-bag-mixbox-best-of-xmas', images: ['/assets/1712_1.jpg'] },

  // Green Tea
  { name: 'Japan Sencha Fukujyu', category: 'green-tea-japan-sencha', images: ['/assets/21042.jpg', '/assets/21042-g50.jpg', '/assets/21042-g150.jpg'] },
  { name: 'Sencha Lemon', category: 'green-tea-sencha-lemon', images: ['/assets/21043.jpg', '/assets/21043-g50.jpg'] },
  { name: 'Green Menthos', category: 'green-menthos', images: ['/assets/21280.jpg', '/assets/21280-g50.jpg'] },
  { name: 'Angels Kiss Green & White Blend', category: 'green-white-tea-blend', images: ['/assets/21044.jpg', '/assets/21044-g50.jpg'] },
  { name: 'Sencha Sakura', category: 'green-tea-sencha-sakura', images: ['/assets/21284.jpg', '/assets/21284-g50.jpg'] },
  { name: 'China Jasmine Tea', category: 'green-tea-china-jasmine', images: ['/assets/21066.jpg', '/assets/21066-g50.jpg'] },
  { name: 'Temple of Heaven', category: 'green-tea-temple-of-heaven', images: ['/assets/21282.jpg', '/assets/21282-g50.jpg'] },

  // Black Tea
  { name: 'Vanilla', category: 'black-tea-vanilla', images: ['/assets/21046.jpg', '/assets/21046-g50.jpg'] },
  { name: 'Earl Grey', category: 'black-tea-earl-grey', images: ['/assets/21063.jpg', '/assets/21063-g50.jpg'] },
  { name: 'Assam FTGFOP1 Mokalbari', category: 'black-tea-assam', images: ['/assets/21065.jpg', '/assets/21065-g50.jpg'] },
  { name: 'East Frisian Leaf Blend', category: 'black-tea-east-frisian', images: ['/assets/21175.jpg', '/assets/21175-g50.jpg'] },
  { name: 'Ceylon OP Highgrown', category: 'black-tea-ceylon', images: ['/assets/21195.jpg', '/assets/21195-g50.jpg'] },
  { name: 'Margarets hope', category: 'black-tea-margarets-hope', images: ['/assets/21040.jpg', '/assets/21040_MargaretsHope.jpg', '/assets/21040-g50.jpg'] },
  { name: 'English Breakfast', category: 'black-tea-english-breakfast', images: ['/assets/21041.jpg', '/assets/21041-g50.jpg', '/assets/21041-g150.jpg'] },

  // Black Tea Blend
  { name: 'Orange Cookies', category: 'black-tea-blend-orange-cookies', images: ['/assets/21170.jpg', '/assets/21170-g50.jpg'] },
  { name: 'East Frisian Sunday Tea', category: 'black-tea-blend-east-frisian-sunday', images: ['/assets/21174.jpg', '/assets/21174-g50.jpg'] },
  { name: "The Emperor's 7 treasures", category: 'black-green-tea-blend-emperors-treasures', images: ['/assets/21045.jpg', '/assets/21045-g50.jpg'] },

  // Rooibos Tea
  { name: 'Bush Fire', category: 'rooibos-tea-blend-bush-fire', images: ['/assets/21047.jpg', '/assets/21047-g50.jpg'] },
  { name: 'Windhuk Vanilla', category: 'rooibos-tea-blend-windhuk-vanilla', images: ['/assets/21164.jpg', '/assets/21164-g50.jpg'] },
  { name: 'Gingerbread Buiscuit Orange', category: 'rooibos-tea-gingerbread-biscuit-orange', images: ['/assets/21167.jpg', '/assets/21167-g50.jpg'] },
  { name: 'Blend Sweet Sin', category: 'rooibos-tea-blend-sweet-sin', images: ['/assets/21172.jpg', '/assets/21172-g50.jpg'] },
  { name: 'Karamell', category: 'rooibos-tea-karamell', images: ['/assets/21232.jpg'] },

  // Fruit Tea Blend
  { name: "Grandma's Garden", category: 'fruit-tea-blend-grandmas-garden', images: ['/assets/21048.jpg', '/assets/21048-g50.jpg'] },
  { name: 'Fair Almond', category: 'fruit-tea-blend-fair-almond', images: ['/assets/21049.jpg', '/assets/21049-g50.jpg'] },
  { name: 'Mango N\' Friends', category: 'fruit-tea-blend-mango-friends', images: ['/assets/21050.jpg', '/assets/21050-g50.jpg'] },
  { name: 'Sea Buckthorn', category: 'fruit-tea-blend-sea-buckthorn', images: ['/assets/21168.jpg', '/assets/21168-g50.jpg'] },
  { name: 'Rhubarb Spritzer', category: 'fruit-tea-blend-rhubarb-spritzer', images: ['/assets/21169.jpg', '/assets/21169-g50.jpg'] },
  { name: 'Turkish Apple Yogurt Lime', category: 'fruit-tea-blend-turkish-apple-yogurt-lime', images: ['/assets/21166.jpg', '/assets/21166-g50.jpg'] },
  { name: 'Advent', category: 'fruit-tea-blend-advent', images: ['/assets/21281.jpg', '/assets/21281-g50-Rauschen_aus.jpg'] },
  { name: 'Cloud Catcher', category: 'fruit-tea-blend-cloud-catcher', images: ['/assets/21285.jpg', '/assets/21285-g50.jpg'] },
  { name: 'Bora Bora', category: 'fruit-tea-blend-bora-bora', images: ['/assets/21286.jpg', '/assets/21286-g50.jpg'] },
  { name: 'Bitter Lemonade', category: 'fruit-tea-blend-bitter-lemonade', images: ['/assets/21343.jpg', '/assets/21343-g50.jpg'] },
  { name: 'Palais Royal', category: 'fruit-tea-blend-palais-royal', images: ['/assets/21609_g50.jpg'] },
  { name: 'Old Love', category: 'fruit-tea-blend-old-love', images: ['/assets/21665.jpg', '/assets/21665-g50.jpg'] },
  { name: 'Orange Dream', category: 'fruit-tea-blend-orange-dream', images: ['/assets/21666.jpg', '/assets/21666-g50.jpg'] },

  // Half Fermented Tea
  { name: 'Milky Oolong', category: 'half-fermented-tea-milky-oolong', images: ['/assets/21287.jpg', '/assets/21287-g50.jpg'] },

  // Herb Tea Blend
  { name: 'Ginger Fresh Tea', category: 'herb-tea-blend-ginger-fresh', images: ['/assets/21051.jpg', '/assets/21051-g50.jpg'] },
  { name: 'Cool Mint', category: 'herb-tea-blend-cool-mint', images: ['/assets/21064.jpg', '/assets/21064-g50.jpg'] },
  { name: 'Orange Grapefruit', category: 'herb-tea-blend-orange-grapefruit', images: ['/assets/21159.jpg', '/assets/21159-g50.jpg'] },
  { name: 'Bad Weather Tea', category: 'herb-tea-blend-bad-weather', images: ['/assets/21160.jpg', '/assets/21160-g50.jpg'] },
  { name: 'Kapha Tea', category: 'herb-tea-blend-kapha', images: ['/assets/21589.jpg', '/assets/21589-g50.jpg'] },
  { name: 'Yoga Tea', category: 'herb-tea-blend-yoga', images: ['/assets/21590.jpg', '/assets/21590-g50.jpg'] },
  { name: 'Fennel Aniseed Cumin', category: 'herb-tea-blend-fennel-aniseed-cumin', images: ['/assets/221610.jpg', '/assets/21610_g50.jpg'] },
  { name: 'Womans Tea', category: 'herb-tea-blend-womans-tea', images: ['/assets/21667.jpg', '/assets/21667-g50.jpg'] },
  { name: 'Vata Tea', category: 'herbal-tea-blend-vata', images: ['/assets/21587.jpg'] },
  { name: 'Pitta Tea', category: 'herbal-tea-blend-pitta', images: ['/assets/21588.jpg', '/assets/21588-g50.jpg'] },
  { name: 'Peppermint', category: 'herb-tea-peppermint', images: ['/assets/21163.jpg', '/assets/21163-g50.jpg'] },
  { name: 'Camomile', category: 'herb-tea-camomile', images: ['/assets/21173.jpg', '/assets/21173-g50.jpg'] },
];

// Add descriptions and prices to products
const enhancedProducts = productsData.map(product => {
  // Default values
  const enhanced = {
    ...product,
    description: `Delicious ${product.name} tea. More details coming soon.`,
    price: Math.round((Math.random() * 20 + 5) * 100) / 100, // Random price between 5 and 25
    countInStock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0-5.0
    numReviews: Math.floor(Math.random() * 50), // Random reviews 0-50
  };
  return enhanced;
});

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const createdProducts = await Product.insertMany(enhancedProducts);
    console.log(`Inserted ${createdProducts.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
