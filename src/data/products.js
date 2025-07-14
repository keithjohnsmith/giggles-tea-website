import React from 'react';
// Helper function to get main category from category slug
const getMainCategory = (categorySlug) => {
  if (!categorySlug) return 'Other';
  
  const parts = categorySlug.split('-');
  if (parts[0] === 'tea' && parts[1] === 'bag') return 'Tea Bag Mixbox';
  if (parts[0] === 'green') return 'Green Tea';
  if (parts[0] === 'black') {
    return parts.length > 2 && parts[2] === 'blend' ? 'Black Tea Blend' : 'Black Tea';
  }
  if (parts[0] === 'rooibos') return 'Rooibos Tea';
  if (parts[0] === 'fruit') return 'Fruit Tea Blend';
  if (parts[0] === 'half') return 'Half Fermented Tea';
  if (parts[0] === 'herb' || parts[0] === 'herbal') return 'Herbal Tea';
  
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

// Product data from seedProducts.js
const products = [
  // Tea Bag Mixbox
  {
    _id: 'tea-bag-mixbox-fruit-classic',
    name: 'No 1 Fruit & Classic',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'A delightful mix of fruity and classic tea flavors in convenient tea bags.',
    stock: 25,
    isActive: true,
    image: '/src/assets/1704.jpg',
    image_1: '/src/assets/1704_1706_1710.jpg',
    tags: ['tea-bag', 'mix', 'fruit', 'classic'],
    rating: 4.5,
    numReviews: 15,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'tea-bag-mixbox-fruit-exotic',
    name: 'No 2 Fruit & Exotic',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'Exotic fruit flavors in convenient tea bags.',
    stock: 20,
    isActive: true,
    image: '/src/assets/1705.jpg',
    image_1: '/src/assets/1705_2.jpg',
    tags: ['tea-bag', 'fruit', 'exotic'],
    rating: 4.3,
    numReviews: 12,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'tea-bag-mixbox-herbal-fruit',
    name: 'No 3 Herbal & Fruit',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'A blend of herbal and fruit flavors in convenient tea bags.',
    stock: 18,
    isActive: true,
    image: '/src/assets/1706.jpg',
    tags: ['tea-bag', 'herbal', 'fruit'],
    rating: 4.6,
    numReviews: 14,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'tea-bag-mixbox-green-fresh',
    name: 'No 4 Green & Fresh',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'Refreshing green tea in convenient tea bags.',
    stock: 22,
    isActive: true,
    image: '/src/assets/1707.jpg',
    image_1: '/src/assets/1707_1711_1705.jpg',
    tags: ['tea-bag', 'green', 'fresh'],
    rating: 4.4,
    numReviews: 10,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'tea-bag-mixbox-black-beauties',
    name: 'No 5 Black & Beauties',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'A selection of black tea blends in convenient tea bags.',
    stock: 20,
    isActive: true,
    image: '/assets/1708.jpg',
    tags: ['tea-bag', 'black', 'blend'],
    rating: 4.7,
    numReviews: 18,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'tea-bag-mixbox-black-pure',
    name: 'No 6 Black & Pure',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'Pure black tea in convenient tea bags.',
    stock: 15,
    isActive: true,
    image: '/assets/1710.jpg',
    tags: ['tea-bag', 'black', 'pure'],
    rating: 4.5,
    numReviews: 12,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'tea-bag-mixbox-pure-clear',
    name: 'No 7 Pure & Clear',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 17.99,
    description: 'Pure and clear tea in convenient tea bags.',
    stock: 18,
    isActive: true,
    image: '/assets/1711.jpg',
    tags: ['tea-bag', 'pure', 'clear'],
    rating: 4.6,
    numReviews: 14,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'tea-bag-mixbox-best-of-xmas',
    name: 'No 8 Best of Xmas',
    category: 'tea-bag-mixbox',
    category_name: 'Tea Bag Mixbox',
    category_slug: 'tea-bag-mixbox',
    price: 19.99,
    description: 'Special Christmas edition tea bags with seasonal flavors.',
    stock: 12,
    isActive: true,
    image: '/assets/1712_1.jpg',
    tags: ['tea-bag', 'christmas', 'seasonal'],
    rating: 4.8,
    numReviews: 22,
    status: 'in-stock',
    featured: true
  },
  
  // Green Tea
  {
    _id: 'green-tea-japan-sencha',
    name: 'Japan Sencha Fukujyu',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 24.99,
    description: 'Premium Japanese Sencha green tea with a fresh, grassy flavor.',
    stock: 35,
    isActive: true,
    image: '/src/assets/21042.jpg',
    image_1: '/src/assets/21042-G50.jpg',
    image_2: '/src/assets/21042-G150.jpg',
    tags: ['green', 'sencha', 'japanese'],
    rating: 4.8,
    numReviews: 28,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'green-tea-sencha-lemon',
    name: 'Sencha Lemon',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 22.99,
    description: 'Refreshing Sencha green tea with natural lemon flavor.',
    stock: 25,
    isActive: true,
    image: '/src/assets/21043.jpg',
    image_1: '/src/assets/21043-G50.jpg',
    tags: ['green', 'sencha', 'lemon'],
    rating: 4.6,
    numReviews: 20,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'green-tea-green-menthos',
    name: 'Green Menthos',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 21.99,
    description: 'Refreshing green tea with a cool minty twist.',
    stock: 25,
    isActive: true,
    image: '/assets/21280.jpg',
    image_1: '/assets/21280-g50.jpg',
    tags: ['green', 'mint', 'refreshing'],
    rating: 4.5,
    numReviews: 18,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'green-tea-angels-kiss',
    name: 'Angels Kiss Green & White Blend',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 23.99,
    description: 'A heavenly blend of green and white teas with floral notes.',
    stock: 20,
    isActive: true,
    image: '/src/assets/21044.jpg',
    image_1: '/src/assets/21044-G50.jpg',
    tags: ['green', 'white', 'blend', 'floral'],
    rating: 4.7,
    numReviews: 22,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'green-tea-sencha-sakura',
    name: 'Sencha Sakura',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 24.99,
    description: 'Delicate sencha green tea with cherry blossom flavor.',
    stock: 18,
    isActive: true,
    image: '/assets/21284.jpg',
    image_1: '/assets/21284-g50.jpg',
    tags: ['green', 'sencha', 'sakura', 'floral'],
    rating: 4.6,
    numReviews: 15,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'green-tea-china-jasmine',
    name: 'China Jasmine Tea',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 19.99,
    description: 'Classic Chinese green tea scented with jasmine flowers.',
    stock: 30,
    isActive: true,
    image: '/assets/21066.jpg',
    image_1: '/assets/21066-g50.jpg',
    tags: ['green', 'jasmine', 'floral'],
    rating: 4.8,
    numReviews: 35,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'green-tea-temple-of-heaven',
    name: 'Temple of Heaven',
    category: 'green-tea',
    category_name: 'Green Tea',
    category_slug: 'green-tea',
    price: 25.99,
    description: 'Premium Chinese gunpowder tea with a rich, smoky flavor.',
    stock: 15,
    isActive: true,
    image: '/assets/21282.jpg',
    image_1: '/assets/21282-g50.jpg',
    tags: ['green', 'gunpowder', 'chinese'],
    rating: 4.8,
    numReviews: 16,
    status: 'in-stock',
    featured: false
  },
  
  // Black Tea
  {
    _id: 'black-tea-vanilla',
    name: 'Vanilla',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 19.99,
    description: 'Smooth black tea with natural vanilla flavor.',
    stock: 30,
    isActive: true,
    image: '/src/assets/21046.jpg',
    image_1: '/src/assets/21046-G50.jpg',
    tags: ['black', 'vanilla', 'flavored'],
    rating: 4.7,
    numReviews: 25,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-earl-grey',
    name: 'Earl Grey',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 21.99,
    description: 'Classic Earl Grey black tea with bergamot oil.',
    stock: 28,
    isActive: true,
    image: '/assets/21063.jpg',
    image_1: '/assets/21063-g50.jpg',
    tags: ['black', 'earl-grey', 'bergamot', 'classic'],
    rating: 4.8,
    numReviews: 32,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-assam',
    name: 'Assam FTGFOP1 Mokalbari',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 24.99,
    description: 'Premium Assam tea with rich, malty flavor and golden tips.',
    stock: 22,
    isActive: true,
    image: '/assets/21065.jpg',
    image_1: '/assets/21065-g50.jpg',
    tags: ['black', 'assam', 'indian', 'premium'],
    rating: 4.9,
    numReviews: 28,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-east-frisian',
    name: 'East Frisian Leaf Blend',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 22.99,
    description: 'Traditional East Frisian tea blend with a strong, robust flavor.',
    stock: 20,
    isActive: true,
    image: '/assets/21175.jpg',
    image_1: '/assets/21175-g50.jpg',
    tags: ['black', 'east-frisian', 'german', 'strong'],
    rating: 4.7,
    numReviews: 18,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'black-tea-ceylon',
    name: 'Ceylon OP Highgrown',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 20.99,
    description: 'High-grown Ceylon tea with bright flavor and golden liquor.',
    stock: 25,
    isActive: true,
    image: '/src/assets/21195.jpg',
    image_1: '/src/assets/21195-G50.jpg',
    tags: ['black', 'ceylon', 'sri-lankan', 'bright'],
    rating: 4.6,
    numReviews: 16,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'black-tea-margarets-hope',
    name: 'Margarets hope',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 26.99,
    description: 'Classic Darjeeling tea with muscatel notes from the famous Margaret\'s Hope estate.',
    stock: 18,
    isActive: true,
    image: '/src/assets/21040.jpg',
    image_1: '/src/assets/21040_MargaretsHope.jpg',
    image_2: '/src/assets/21040-G50.jpg',
    tags: ['black', 'darjeeling', 'indian', 'premium'],
    rating: 4.9,
    numReviews: 30,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-english-breakfast',
    name: 'English Breakfast',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 18.99,
    description: 'Classic English Breakfast blend, perfect to start your day.',
    stock: 35,
    isActive: true,
    image: '/src/assets/21041.jpg',
    image_1: '/src/assets/21041-G50.jpg',
    image_2: '/src/assets/21041-G150.jpg',
    tags: ['black', 'english', 'breakfast', 'classic'],
    rating: 4.8,
    numReviews: 42,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-earl-grey',
    name: 'Earl Grey',
    category: 'black-tea',
    category_name: 'Black Tea',
    category_slug: 'black-tea',
    price: 21.99,
    description: 'Classic Earl Grey black tea with bergamot oil.',
    stock: 28,
    isActive: true,
    image: '/assets/21063.jpg',
    image_1: '/assets/21063-g50.jpg',
    tags: ['black', 'earl-grey', 'bergamot'],
    rating: 4.9,
    numReviews: 35,
    status: 'in-stock',
    featured: true
  },
  
  // Black Tea Blend
  {
    _id: 'black-tea-blend-orange-cookies',
    name: 'Orange Cookies',
    category: 'black-tea-blend',
    category_name: 'Black Tea Blend',
    category_slug: 'black-tea-blend',
    price: 22.99,
    description: 'Aromatic black tea with zesty orange and sweet cookie flavors.',
    stock: 20,
    isActive: true,
    image: '/assets/21170.jpg',
    image_1: '/assets/21170-g50.jpg',
    tags: ['black', 'blend', 'orange', 'cookies', 'flavored'],
    rating: 4.7,
    numReviews: 24,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-blend-east-frisian-sunday',
    name: 'East Frisian Sunday Tea',
    category: 'black-tea-blend',
    category_name: 'Black Tea Blend',
    category_slug: 'black-tea-blend',
    price: 23.99,
    description: 'Special Sunday blend of East Frisian tea with a touch of cream flavor.',
    stock: 18,
    isActive: true,
    image: '/assets/21174.jpg',
    image_1: '/assets/21174-g50.jpg',
    tags: ['black', 'blend', 'east-frisian', 'cream', 'german'],
    rating: 4.8,
    numReviews: 20,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'black-tea-blend-emperors-treasures',
    name: "The Emperor's 7 Treasures",
    category: 'black-tea-blend',
    category_name: 'Black Tea Blend',
    category_slug: 'black-tea-blend',
    price: 26.99,
    description: 'A luxurious blend of seven premium ingredients fit for an emperor.',
    stock: 15,
    isActive: true,
    image: '/src/assets/21045.jpg',
    image_1: '/src/assets/21045-G50.jpg',
    tags: ['black', 'blend', 'premium', 'luxury', 'special'],
    rating: 4.9,
    numReviews: 30,
    status: 'in-stock',
    featured: true
  },

  // Rooibos Tea
  {
    _id: 'rooibos-tea-blend-bush-fire',
    name: 'Bush Fire',
    category: 'rooibos-tea',
    category_name: 'Rooibos Tea',
    category_slug: 'rooibos-tea',
    price: 18.99,
    description: 'Spicy rooibos blend with a hint of chili and cinnamon.',
    stock: 20,
    isActive: true,
    image: '/src/assets/21047.jpg',
    image_1: '/src/assets/21047-G50.jpg',
    tags: ['rooibos', 'spicy', 'caffeine-free'],
    rating: 4.8,
    numReviews: 22,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'rooibos-tea-vanilla-dream',
    name: 'Vanilla Dream',
    category: 'rooibos-tea',
    category_name: 'Rooibos Tea',
    category_slug: 'rooibos-tea',
    price: 19.99,
    description: 'Smooth rooibos with sweet vanilla notes, naturally caffeine-free.',
    stock: 25,
    isActive: true,
    image: '/src/assets/21164.jpg',
    image_1: '/src/assets/21164-G50.jpg',
    tags: ['rooibos', 'vanilla', 'sweet', 'caffeine-free'],
    rating: 4.7,
    numReviews: 28,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'rooibos-tea-honeybush-vanilla',
    name: 'Honeybush Vanilla',
    category: 'rooibos-tea',
    category_name: 'Rooibos Tea',
    category_slug: 'rooibos-tea',
    price: 20.99,
    description: 'Naturally sweet honeybush rooibos with creamy vanilla flavor.',
    stock: 22,
    isActive: true,
    image: '/src/assets/21165.jpg',
    image_1: '/src/assets/21165-G50.jpg',
    tags: ['rooibos', 'honeybush', 'vanilla', 'sweet', 'caffeine-free'],
    rating: 4.8,
    numReviews: 24,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'rooibos-tea-caramel-cream',
    name: 'Caramel Cream',
    category: 'rooibos-tea',
    category_name: 'Rooibos Tea',
    category_slug: 'rooibos-tea',
    price: 21.99,
    description: 'Decadent rooibos blend with smooth caramel and cream flavors.',
    stock: 18,
    isActive: true,
    image: '/src/assets/21166.jpg',
    image_1: '/src/assets/21166-G50.jpg',
    tags: ['rooibos', 'caramel', 'cream', 'sweet', 'caffeine-free'],
    rating: 4.9,
    numReviews: 30,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'rooibos-tea-african-sunset',
    name: 'African Sunset',
    category: 'rooibos-tea',
    category_name: 'Rooibos Tea',
    category_slug: 'rooibos-tea',
    price: 20.99,
    description: 'Fruity rooibos blend with tropical flavors, reminiscent of an African sunset.',
    stock: 20,
    isActive: true,
    image: '/src/assets/21167.jpg',
    image_1: '/src/assets/21167-G50.jpg',
    tags: ['rooibos', 'fruity', 'tropical', 'caffeine-free'],
    rating: 4.7,
    numReviews: 22,
    status: 'in-stock',
    featured: false
  },
  
  // Fruit Tea Blend
  {
    _id: 'fruit-tea-blend-grandmas-garden',
    name: "Grandma's Garden",
    category: 'fruit-tea',
    category_name: 'Fruit Tea',
    category_slug: 'fruit-tea',
    price: 19.99,
    description: 'A nostalgic blend of fruits and berries reminiscent of grandma\'s garden.',
    stock: 25,
    isActive: true,
    image: '/src/assets/21048.jpg',
    image_1: '/src/assets/21048-G50.jpg',
    tags: ['fruit', 'herbal', 'caffeine-free'],
    rating: 4.7,
    numReviews: 30,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'fruit-tea-blend-wild-berries',
    name: 'Wild Berries',
    category: 'fruit-tea',
    category_name: 'Fruit Tea',
    category_slug: 'fruit-tea',
    price: 20.99,
    description: 'A vibrant blend of wild berries with a naturally sweet and tangy flavor.',
    stock: 22,
    isActive: true,
    image: '/src/assets/21168.jpg',
    image_1: '/src/assets/21168-G50.jpg',
    tags: ['fruit', 'berries', 'sweet', 'caffeine-free'],
    rating: 4.8,
    numReviews: 28,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'fruit-tea-blend-tropical-sunrise',
    name: 'Tropical Sunrise',
    category: 'fruit-tea',
    category_name: 'Fruit Tea',
    category_slug: 'fruit-tea',
    price: 21.99,
    description: 'A tropical blend of mango, pineapple, and passionfruit for a taste of paradise.',
    stock: 20,
    isActive: true,
    image: '/src/assets/21169.jpg',
    image_1: '/src/assets/21169-G50.jpg',
    tags: ['fruit', 'tropical', 'mango', 'pineapple', 'passionfruit', 'caffeine-free'],
    rating: 4.7,
    numReviews: 25,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'fruit-tea-blend-citrus-splash',
    name: 'Citrus Splash',
    category: 'fruit-tea',
    category_name: 'Fruit Tea',
    category_slug: 'fruit-tea',
    price: 19.99,
    description: 'A refreshing blend of orange, lemon, and grapefruit with a zesty kick.',
    stock: 23,
    isActive: true,
    image: '/assets/21170.jpg',
    image_1: '/assets/21170-g50.jpg',
    tags: ['fruit', 'citrus', 'refreshing', 'caffeine-free'],
    rating: 4.6,
    numReviews: 20,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'fruit-tea-blend-forest-fruits',
    name: 'Forest Fruits',
    category: 'fruit-tea',
    category_name: 'Fruit Tea',
    category_slug: 'fruit-tea',
    price: 20.99,
    description: 'A rich blend of forest berries including blackcurrant, raspberry, and blackberry.',
    stock: 21,
    isActive: true,
    image: '/src/assets/21171.jpg',
    image_1: '/src/assets/21171-G50.jpg',
    tags: ['fruit', 'berries', 'forest', 'caffeine-free'],
    rating: 4.8,
    numReviews: 26,
    status: 'in-stock',
    featured: true
  },
  
  // Herbal Tea
  {
    _id: 'herb-tea-peppermint',
    name: 'Peppermint',
    category: 'herbal-tea',
    category_name: 'Herbal Tea',
    category_slug: 'herbal-tea',
    price: 16.99,
    description: 'Pure peppermint leaves for a refreshing and digestive tea.',
    stock: 40,
    isActive: true,
    image: '/src/assets/21163.jpg',
    image_1: '/src/assets/21163-G50.jpg',
    tags: ['herbal', 'peppermint', 'digestive', 'caffeine-free'],
    rating: 4.9,
    numReviews: 45,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'herb-tea-chamomile',
    name: 'Chamomile',
    category: 'herbal-tea',
    category_name: 'Herbal Tea',
    category_slug: 'herbal-tea',
    price: 15.99,
    description: 'Gentle chamomile flowers known for their calming and relaxing properties.',
    stock: 35,
    isActive: true,
    image: '/src/assets/21172.jpg',
    image_1: '/src/assets/21172-G50.jpg',
    tags: ['herbal', 'chamomile', 'relaxing', 'caffeine-free'],
    rating: 4.8,
    numReviews: 38,
    status: 'in-stock',
    featured: true
  },
  {
    _id: 'herb-tea-lemongrass-ginger',
    name: 'Lemongrass & Ginger',
    category: 'herbal-tea',
    category_name: 'Herbal Tea',
    category_slug: 'herbal-tea',
    price: 17.99,
    description: 'Zesty blend of lemongrass and ginger for a refreshing and invigorating tea.',
    stock: 30,
    isActive: true,
    image: '/src/assets/21173.jpg',
    image_1: '/src/assets/21173-G50.jpg',
    tags: ['herbal', 'lemongrass', 'ginger', 'digestive', 'caffeine-free'],
    rating: 4.7,
    numReviews: 32,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'herb-tea-hibiscus-rosehip',
    name: 'Hibiscus & Rosehip',
    category: 'herbal-tea',
    category_name: 'Herbal Tea',
    category_slug: 'herbal-tea',
    price: 16.99,
    description: 'Tart and fruity blend of hibiscus and rosehip, rich in vitamin C.',
    stock: 28,
    isActive: true,
    image: '/assets/21174.jpg',
    image_1: '/assets/21174-g50.jpg',
    tags: ['herbal', 'hibiscus', 'rosehip', 'vitamin-c', 'caffeine-free'],
    rating: 4.6,
    numReviews: 25,
    status: 'in-stock',
    featured: false
  },
  {
    _id: 'herb-tea-rooibos-chai',
    name: 'Rooibos Chai',
    category: 'herbal-tea',
    category_name: 'Herbal Tea',
    category_slug: 'herbal-tea',
    price: 18.99,
    description: 'Warming chai spices blended with smooth rooibos, naturally caffeine-free.',
    stock: 25,
    isActive: true,
    image: '/assets/21175.jpg',
    image_1: '/assets/21175-g50.jpg',
    tags: ['herbal', 'rooibos', 'chai', 'spiced', 'caffeine-free'],
    rating: 4.8,
    numReviews: 30,
    status: 'in-stock',
    featured: true
  }
];

// Get all products with optional filtering
const getProducts = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Filter products based on provided filters
  let filteredProducts = [...products];
  
  // Filter by category if specified
  if (filters.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category_slug === filters.category
    );
  }
  
  // Filter by search term if specified
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Filter by featured if specified
  if (filters.featured) {
    filteredProducts = filteredProducts.filter(product => product.featured);
  }
  
  // Filter by status if specified
  if (filters.status) {
    filteredProducts = filteredProducts.filter(
      product => product.status === filters.status
    );
  }
  
  // Filter active products if not specified otherwise
  if (filters.activeOnly !== false) {
    filteredProducts = filteredProducts.filter(product => product.isActive);
  }
  
  // Apply sorting if specified
  if (filters.sortBy) {
    filteredProducts.sort((a, b) => {
      if (filters.sortBy === 'price') {
        return filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
      } else if (filters.sortBy === 'name') {
        return filters.sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'rating') {
        return filters.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      }
      return 0;
    });
  }
  
  // Apply pagination if specified
  if (filters.page && filters.limit) {
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return {
      products: filteredProducts.slice(startIndex, endIndex),
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / filters.limit),
      page: filters.page,
      limit: filters.limit
    };
  }
  
  return {
    products: filteredProducts,
    total: filteredProducts.length,
    pages: 1,
    page: 1,
    limit: filteredProducts.length
  };
};

// Get a single product by ID
const getProductById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const product = products.find(p => p._id === id);
  if (!product) {
    throw new Error('Product not found');
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const response = await fetch('/api/products?featured=true');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Handle different response formats
    const products = data.data || data;
    if (!Array.isArray(products)) {
      throw new Error('Invalid response format: expected array of products');
    }
    
    return products.map(product => ({
      ...product,
      // Ensure all required fields have defaults
      id: product.id || product._id,
      name: product.name || product.product_name || 'Unnamed Product',
      price: parseFloat(product.price) || 0,
      displayPrice: `R${parseFloat(product.price || 0).toFixed(2)}`,
      image: product.image || product.image_1 || '',
      category: product.category_name || product.category || 'Uncategorized',
      category_name: product.category_name || product.category,
      category_slug: product.category_slug || (product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : 'uncategorized'),
      isActive: product.isActive !== false
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Fallback to empty array if API fails
    return [];
  }
};

export {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getMainCategory
};
