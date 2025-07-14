import React from 'react';
/**
 * Processes product data from JSON format to a consistent format
 * @param {Array} products - Array of product objects
 * @returns {Array} Processed array of product objects
 */
export const processProductData = (products) => {
  return products.map(product => {
    // Ensure images is an array and has at least one image
    let images = [];
    
    if (Array.isArray(product.images)) {
      // Process existing format with single image path
      images = product.images.map(img => 
        img.startsWith('http') ? img : `src/assets/${img}`
      );
    } else if (product.image) {
      // Handle case where there's a single image string
      images = [product.image.startsWith('http') ? product.image : `src/assets/${product.image}`];
    }
    
    // If no images, use a default placeholder
    if (images.length === 0) {
      images.push('src/assets/images/placeholder-product.jpg');
    }

    // Determine category - prefer English category if available
    const category = product.category_en || product.category || 'Uncategorized';
    
    // Clean up the product data
    return {
      id: product.id || product.code || `product-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name || 'Unnamed Product',
      germanName: product.germanName || product.name || '',
      category,
      price: typeof product.price === 'number' ? product.price : 0,
      description: product.description || '',
      images,
      // Include any additional fields from the original product
      ...product
    };
  });
};

/**
 * Groups products by category
 * @param {Array} products - Array of product objects
 * @returns {Object} Products grouped by category
 */
export const groupProductsByCategory = (products) => {
  // First group by category
  const grouped = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
  
  // Sort categories alphabetically, but put 'Ayurveda' at the end
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a.toLowerCase() === 'ayurveda') return 1;
    if (b.toLowerCase() === 'ayurveda') return -1;
    return a.localeCompare(b);
  });
  
  // Create a new object with sorted categories
  const result = {};
  sortedCategories.forEach(category => {
    result[category] = grouped[category];
  });
  
  return result;
};
