import { productService } from '../services/api';
import React from 'react';

/**
 * Processes raw product data into the application's format
 * @param {Array} [data] - Optional data to process, fetches from API if not provided
 * @returns {Promise<Array>} Processed product data
 */
const processTeaData = async (data = null) => {
  // If no data provided, fetch from API
  if (!data) {
    try {
      console.log('Fetching products from API...');
      data = await productService.getAll();
      console.log(`Successfully fetched ${data.length} products from API`);
    } catch (error) {
      console.error('Error fetching products from API:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      // Return empty array but log the error for debugging
      return [];
    }
  }
  console.log(`Processing ${data.length} products from input data`);
  
  const processed = data.map((product) => {
    if (!product || typeof product !== 'object') {
      console.warn('Skipping invalid product:', product);
      return null;
    }

    // Process images - handle both string and array formats
    let imageSources = [];
    
    // Handle case where images is a string (single image)
    if (typeof product.images === 'string') {
      imageSources = [product.images];
    } 
    // Handle case where images is an array
    else if (Array.isArray(product.images)) {
      imageSources = [...product.images];
    }
    
    // Process each image path
    const images = imageSources.map(img => {
      if (!img) return null;
      
      // Convert backslashes to forward slashes, trim, and normalize
      let cleanPath = String(img).replace(/\\/g, '/').trim();
      
      // Skip if empty after cleaning
      if (!cleanPath) return null;
      
      // If it's already a full URL or data URI, use as is
      if (cleanPath.match(/^(https?:|data:|\/\/)/i)) {
        return cleanPath;
      }
      
      // Remove any leading slashes or dots to prevent path traversal
      cleanPath = cleanPath.replace(/^[./\\]+/, '');
      
      // Handle cases where 'Tea Catalogue' might be duplicated in the path
      const teaCatalogueRegex = /(tea\s*catalogue\/)/gi;
      const hasTeaCatalogue = teaCatalogueRegex.test(cleanPath.toLowerCase());
      
      if (hasTeaCatalogue) {
        // Remove any duplicate 'Tea Catalogue' segments
        const parts = cleanPath.split('/');
        const dedupedParts = [];
        let teaCatalogueFound = false;
        
        for (const part of parts) {
          const isTeaCatalogue = teaCatalogueRegex.test(part.toLowerCase());
          if (isTeaCatalogue) {
            if (!teaCatalogueFound) {
              dedupedParts.push('Tea%20Catalogue');
              teaCatalogueFound = true;
            }
          } else if (part.trim() !== '') {
            dedupedParts.push(part);
          }
        }
        
        // Reconstruct the path with proper encoding
        return `/${dedupedParts.join('/')}`;
      }
      
      // For paths without 'Tea Catalogue', construct the path using product ID
      const productId = String(product.id || '').trim();
      if (!productId) {
        console.warn('Product ID is missing, cannot construct image path for:', cleanPath);
        return null;
      }
      
      // Remove any product ID prefix if already present in the path
      const filename = cleanPath.replace(new RegExp(`^${productId}[\\/]?`, 'i'), '');
      
      // Construct the full path with proper encoding
      return `/Tea%20Catalogue/${productId}/${filename}`;
    }).filter(Boolean);

    // Ensure we have at least one image
    if (images.length === 0) {
      console.warn(`No images found for product ${product.id || 'unknown'}`);
      // Use a simple SVG placeholder
      const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E`;
      images.push(placeholderSvg);
    } else {
      console.log(`Found ${images.length} images for product ${product.id || 'unknown'}:`, images);
    }

    // Process hover image if it exists
    let hoverImage = null;
    if (product.hoverImage) {
      let cleanHoverPath = product.hoverImage.replace(/\\/g, '/').trim();
      if (!(cleanHoverPath.match(/^(https?:|data:|\/\/)/i))) {
        cleanHoverPath = cleanHoverPath.replace(/^[./]+/, '');
        
        // Handle duplicate 'Tea Catalogue' in hover image path
        const teaCatalogueRegex = /(tea\s*catalogue\/)/gi;
        const hasTeaCatalogue = teaCatalogueRegex.test(cleanHoverPath.toLowerCase());
        
        if (hasTeaCatalogue) {
          // Remove any duplicate 'Tea Catalogue' segments
          const parts = cleanHoverPath.split('/');
          const dedupedParts = [];
          let teaCatalogueFound = false;
          
          for (const part of parts) {
            const isTeaCatalogue = teaCatalogueRegex.test(part.toLowerCase());
            if (isTeaCatalogue) {
              if (!teaCatalogueFound) {
                dedupedParts.push('Tea%20Catalogue');
                teaCatalogueFound = true;
              }
            } else if (part.trim() !== '') {
              dedupedParts.push(part);
            }
          }
          
          hoverImage = `/${dedupedParts.join('/')}`;
        } else {
          const productId = product.id || '';
          cleanHoverPath = `Tea Catalogue/${productId}/${cleanHoverPath}`;
        }
        hoverImage = `/${cleanHoverPath}`;
      } else {
        hoverImage = cleanHoverPath;
      }
    }

    // Create the processed product with the correct structure
    const processedProduct = {
      id: product.id || `product-${Date.now()}`,
      name: product.name || 'Unnamed Product',
      germanName: product.germanName || product.name || 'Unbenanntes Produkt',
      category: product.category || 'Uncategorized',
      category_en: product.category_en || product.category || 'Uncategorized',
      price: parseFloat(product.price) || 0,
      description: product.description || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      images: images,
      hoverImage: hoverImage
    };

    return processedProduct;
  }).filter(Boolean); // Remove any null entries

  console.log(`Successfully processed ${processed.length} products`);
  return processed.filter(Boolean);
};

/**
 * Get unique categories from processed tea data
 * @param {Array} [teaData] - Optional tea data, will be processed if not provided
 * @returns {Promise<Object>} Object with english and german categories
 */
const getCategories = async (teaData = null) => {
  try {
    // If no teaData provided, process the default data
    const processedData = teaData || await processTeaData();
    
    // Extract unique categories
    const categories = {
      en: new Set(),
      de: new Set()
    };
    
    // First, try to get categories from the products
    processedData.forEach(tea => {
      if (tea.category_en) categories.en.add(tea.category_en);
      if (tea.category_de) categories.de.add(tea.category_de);
      if (tea.category) {
        // If we have a category but not the language-specific ones, use it for both
        if (!tea.category_en) categories.en.add(tea.category);
        if (!tea.category_de) categories.de.add(tea.category);
      }
    });
    
    // If no categories found in products, try to fetch from the categories table
    if (categories.en.size === 0 && categories.de.size === 0) {
      try {
        const response = await fetch('/server/api/categories.php');
        if (response.ok) {
          const categoryData = await response.json();
          if (Array.isArray(categoryData)) {
            categoryData.forEach(cat => {
              if (cat.name_en) categories.en.add(cat.name_en);
              if (cat.name_de) categories.de.add(cat.name_de);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching categories from API:', error);
      }
    }
    
    // If still no categories, add some defaults
    if (categories.en.size === 0) {
      const defaultCategories = ['Black Tea', 'Green Tea', 'Herbal Tea', 'Fruit Tea', 'White Tea', 'Oolong', 'Rooibos', 'Ayurveda'];
      defaultCategories.forEach(cat => {
        categories.en.add(cat);
      });
    }
    if (categories.de.size === 0) {
      const defaultCategories = ['Schwarzer Tee', 'Grüner Tee', 'Kräutertee', 'Früchtetee', 'Weißer Tee', 'Oolong', 'Rooibos', 'Ayurveda'];
      defaultCategories.forEach(cat => {
        categories.de.add(cat);
      });
    }
    
    // Convert sets to arrays and sort, but ensure 'Ayurveda' is last
    const sortCategories = (categories) => {
      const sorted = [...categories].sort();
      const ayurvedaIndex = sorted.indexOf('Ayurveda');
      if (ayurvedaIndex > -1) {
        sorted.splice(ayurvedaIndex, 1);
        sorted.push('Ayurveda');
      }
      return sorted;
    };
    
    return {
      en: sortCategories(categories.en),
      de: sortCategories(categories.de)
    };
  } catch (error) {
    console.error('Error in getCategories:', error);
    // Return default categories if there's an error
    return {
      en: ['Black Tea', 'Green Tea', 'Herbal Tea', 'Fruit Tea', 'White Tea', 'Oolong', 'Rooibos'],
      de: ['Schwarzer Tee', 'Grüner Tee', 'Kräutertee', 'Früchtetee', 'Weißer Tee', 'Oolong', 'Rooibos']
    };
  }
};

export { processTeaData, getCategories };
