// Import config and helper utilities
import config, { getImageUrl } from '../config';

// Get the api object with getApiUrl method
const { api } = config;

// Helper to determine if backend response indicates success (supports both legacy and new formats)

// Helper to transform a raw backend product into the shape the React UI expects
const transformProduct = (product) => {
  if (!product || typeof product !== 'object') return {};

  // Extract first category names for convenience
  let category_en = '';
  let category_de = '';
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    category_en = product.categories[0].name_en || '';
    category_de = product.categories[0].name_de || '';
  }
  // Fallback to direct category fields if categories array is absent or empty
  if (!category_en && (product.category_en || product.category)) {
    category_en = product.category_en || product.category || '';
  }
  if (!category_de && (product.category || product.category_de)) {
    category_de = product.category_de || product.category || '';
  }

  // Build image list (ensure full URLs)
  const imagesArr = Array.isArray(product.images) ? product.images.map(getImageUrl) : [];
  const primaryImage = imagesArr.length > 0 ? imagesArr[0] : (product.image ? getImageUrl(product.image) : '');

  return {
    id: product.id,
    code: product.code || product.sku || String(product.id),
    name: product.name,
    germanName: product.german_name || product.germanName || '',
    price: parseFloat(product.price) || 0,
    displayPrice: product.display_price || undefined,
    image: primaryImage,
    images: imagesArr,
    description: product.description_en || product.description || '',
    category_en,
    category_de,
    category: category_en || category_de || 'Uncategorized',
    // Provide an explicit alias for components that expect `category_name`
    category_name: category_en || category_de || 'Uncategorized',
    categories: Array.isArray(product.categories) ? product.categories : [],
    category_id: product.category_id || null,
    hoverImage: imagesArr.length > 1 ? imagesArr[1] : undefined,
  };
};
const isApiSuccess = (res) => {
  if (!res) return false;
  if (typeof res.success !== 'undefined') return !!res.success; // newer style boolean flag
  return res.status === 'success'; // legacy/back-end flag
};

/**
 * Product Service for interacting with the PHP backend API
 */
const productService = {
  /**
   * Get all products with pagination support
   * @param {Object} options - Pagination and filtering options
   * @param {number} [options.page=1] - Page number to fetch (1-based)
   * @param {number} [options.limit=100] - Number of items per page
   * @param {boolean} [options.fetchAll=false] - Whether to fetch all pages
   * @param {Object} [options.filters={}] - Filters to apply to the query
   * @returns {Promise<{products: Array, pagination: Object}>} Object containing products and pagination info
   */
  getAll: async ({ page = 1, limit = 100, fetchAll = false, filters = {} } = {}) => {
    try {
      // If fetchAll is true, we'll fetch all pages recursively
      if (fetchAll) {
        let allProducts = [];
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const queryParams = { page: currentPage, limit, ...filters };
          const response = await fetch(api.getApiUrl('products', queryParams), {
            ...api.fetchOptions,
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (isApiSuccess(result) && result.data) {
            const { data, pagination } = result.data;
            
            if (Array.isArray(data)) {
              // Transform and add products from this page
              const products = data.map(transformProduct);
              allProducts = [...allProducts, ...products];
              
              // Check if there are more pages to fetch
              hasMorePages = pagination && pagination.page < pagination.pages;
              currentPage++;
            } else {
              hasMorePages = false;
            }
          } else {
            hasMorePages = false;
          }
        }
        
        return {
          products: allProducts,
          pagination: {
            total: allProducts.length,
            page: 1,
            pages: 1,
            limit: allProducts.length
          }
        };
      }
      
      // Single page fetch
      const queryParams = { page, limit, ...filters };
      const response = await fetch(api.getApiUrl('products', queryParams), {
        ...api.fetchOptions,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform the API response to match the frontend's expected format
      if (isApiSuccess(result) && result.data) {
        const { data, pagination } = result.data;
        
        return {
          products: Array.isArray(data) ? data.map(transformProduct) : [],
          pagination: pagination || {
            total: 0,
            page: 1,
            pages: 1,
            limit: 10
          }
        };
      }
      
      console.error('Unexpected API response format:', result);
      return { products: [], pagination: { total: 0, page: 1, pages: 1, limit: 10 } };
      
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  getById: async (id) => {
    try {
      const response = await fetch(api.getApiUrl('products', { id }), {
        ...api.fetchOptions,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform the API response to match the frontend's expected format
      if (isApiSuccess(result) && result.data) {
        let productData = result.data.data || result.data;
        const product = Array.isArray(productData) ? productData[0] : productData;
        if (!product) return null;
        
        return transformProduct(product);
      }
      
      console.error('Product not found or invalid response format:', result);
      return null;
      
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured products
   * @returns {Promise<Array>} Array of featured products
   */
  getFeatured: async () => {
    try {
      // Get featured products (you might want to modify the API to handle this filter)
      const response = await fetch(api.getApiUrl('products', { featured: true }), {
        ...api.fetchOptions,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // If we have featured products, return them, otherwise get the first 8 products
      if (isApiSuccess(result) && result.data && Array.isArray(result.data.data) && result.data.data.length > 0) {
        return result.data.data.slice(0, 8).map(transformProduct);
      }
      
      // Fallback to getting all products if no featured products found
      console.log('No featured products found, falling back to first 8 products');
      const allProducts = await productService.getAll();
      return allProducts.slice(0, 8);
      
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }
};

export default productService;
