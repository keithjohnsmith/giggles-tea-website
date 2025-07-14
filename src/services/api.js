// Import configuration
import { getApiUrl, getImageUrl, config } from '../config';
import React from 'react';

// Log environment for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('Current hostname:', window.location.hostname);
console.log('API Base URL:', config.api.baseUrl);

// Common fetch options
const fetchOptions = (method = 'GET', body = null, token = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    credentials: 'include', // Important for cookies/sessions
    mode: 'cors',
    cache: 'no-store',
  };

  // Add CORS headers for development
  if (import.meta.env.DEV) {
    options.headers['Access-Control-Allow-Origin'] = window.location.origin;
    options.headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  console.log('Fetch options:', {
    ...options,
    body: body ? '[REDACTED]' : null,
    headers: { ...options.headers, Authorization: options.headers.Authorization ? 'Bearer [REDACTED]' : 'None' }
  });

  return options;
};

// Helper function to handle responses
const handleResponse = async (response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const contentType = response.headers.get('content-type');
  let data;
  
  try {
    const text = await response.text();
    console.log('Raw response text:', text);
    
    if (text) {
      if (contentType && contentType.includes('application/json')) {
        data = JSON.parse(text);
      } else {
        // Handle non-JSON responses
        data = { message: text };
      }
    } else {
      data = {};
    }
  } catch (e) {
    console.error('Error parsing response:', e);
    throw new Error(`Failed to parse response: ${e.message}`);
  }
  
  if (!response.ok) {
    const error = new Error(data.message || `API request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    console.error('API Error:', error);
    throw error;
  }
  
  return data;
  
  return data;
};

// Auth API
export const authService = {
  login: async (email, password) => {
    console.log('Login request to:', `${API_URL}/auth/login`);
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data && data.user) {
        return { user: data.user, success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  getProfile: async () => {
    // For the client showcase, just return the hardcoded user
    // In a real app, this would validate the session with the server
    console.log('Using simplified profile for client showcase');
    return {
      _id: '1',
      username: 'Giggles Tea',
      email: 'admin@giggles-tea.com',
      role: 'admin',
      name: 'Giggles Tea Admin'
    };
    
    /* Original implementation (commented out)
    try {
      const response = await fetch(
        `${API_URL}/auth/me`,
        fetchOptions('GET')
      );
      
      if (!response.ok) {
        // If we get a 401, it means the session is invalid
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
    */
  }
};

// Helper function to transform product data from API to frontend format
const transformProduct = (product) => {
  if (!product) return null;
  
  // Process images - ensure it's an array and handle different formats
  let images = [];
  if (Array.isArray(product.images)) {
    images = product.images.map(img => getImageUrl(img));
  } else if (typeof product.image === 'string') {
    // Handle case where there's a single image in an 'image' field
    images = [getImageUrl(product.image)];
  } else if (product.image_path) {
    // Handle case where there's a single image in 'image_path'
    images = [getImageUrl(product.image_path)];
  }
  
  // If no images found but there's a primary_image, use that
  if (images.length === 0 && product.primary_image) {
    images = [getImageUrl(product.primary_image)];
  }
  
  return {
    ...product,
    id: String(product.id || '').trim(),
    price: Number(product.price) || 0,
    isActive: product.is_active !== undefined ? Boolean(product.is_active) : true,
    images: images,
    // Ensure other common fields have proper defaults
    category: product.category || 'Uncategorized',
    description: product.description || '',
    name: product.name || 'Unnamed Product'
  };
};

// Helper function to fetch a single page of products
const fetchProductsPage = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(
      getApiUrl('products', { page, limit }),
      fetchOptions()
    );
    const data = await handleResponse(response);
    return {
      products: Array.isArray(data.data) ? data.data.map(transformProduct) : [],
      pages: Number(data.pages) || 1,
      page: Number(data.page) || 1,
      total: Number(data.total) || 0,
      limit: Number(data.limit) || limit
    };
  } catch (error) {
    console.error('Error fetching products page:', error);
    return { products: [], pages: 1, page: 1, total: 0, limit };
  }
};

// Products API
export const productService = {
  /**
   * Get all products with optional filtering
   * @param {Object} options - Filtering options
   * @returns {Promise<Array>} Array of products
   */
  getAll: async (options = {}) => {
    try {
      const { page = 1, limit = 10, category } = options;
      let url = `${getApiUrl('products')}?page=${page}&limit=${limit}`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url, {
        ...config.api.fetchOptions,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.api.fetchOptions.headers
        }
      });
      
      const result = await handleResponse(response);
      
      if (result && result.success && Array.isArray(result.data)) {
        return result.data.map(transformProduct);
      } else if (Array.isArray(result)) {
        return result.map(transformProduct);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async getById(id) {
    if (!id) return null;
    
    try {
      const response = await fetch(
        getApiUrl('products', { id }),
        fetchOptions()
      );
      
      const data = await handleResponse(response);
      return transformProduct(data.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured products
   * @returns {Promise<Array>} Array of featured products
   */
  async getFeatured() {
    try {
      const response = await fetch(
        getApiUrl('products', { featured: true }),
        fetchOptions()
      );
      
      const data = await handleResponse(response);
      return Array.isArray(data.data) ? data.data.map(transformProduct) : [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    try {
      const response = await fetch(
        getApiUrl('products'),
        fetchOptions('POST', productData)
      );
      
      const data = await handleResponse(response);
      return transformProduct(data.data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, productData) {
    if (!id) throw new Error('Product ID is required for update');
    
    try {
      const response = await fetch(
        getApiUrl('products', { id }),
        fetchOptions('PUT', productData)
      );
      
      const data = await handleResponse(response);
      return transformProduct(data.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a product
   * @param {string|number} id - Product ID
   * @returns {Promise<boolean>} True if successful
   */
  async delete(id) {
    if (!id) throw new Error('Product ID is required for deletion');
    
    try {
      const response = await fetch(
        getApiUrl('products', { id }),
        fetchOptions('DELETE')
      );
      
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Search products by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   */
  async search(query) {
    if (!query) return [];
    
    try {
      const response = await fetch(
        getApiUrl('products', { q: query }),
        fetchOptions()
      );
      
      const data = await handleResponse(response);
      return Array.isArray(data.data) ? data.data.map(transformProduct) : [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
};

// Orders API
export const orderService = {
  create: async (orderData, token) => {
    const response = await fetch(
      `${API_URL}/orders`,
      fetchOptions('POST', orderData, token)
    );
    return handleResponse(response);
  },

  getByUser: async (userId, token) => {
    const response = await fetch(
      `${API_URL}/orders/user/${userId}`,
      fetchOptions('GET', null, token)
    );
    return handleResponse(response);
  }
};

// User Management API
export const userService = {
  getAllUsers: async (token) => {
    const response = await fetch(
      `${API_URL}/admin/users`,
      fetchOptions('GET', null, token)
    );
    return handleResponse(response);
  },

  createUser: async (userData, token) => {
    const response = await fetch(
      `${API_URL}/admin/users`,
      fetchOptions('POST', userData, token)
    );
    return handleResponse(response);
  },

  updateUser: async (userId, userData, token) => {
    const response = await fetch(
      `${API_URL}/admin/users/${userId}`,
      fetchOptions('PUT', userData, token)
    );
    return handleResponse(response);
  },

  deleteUser: async (userId, token) => {
    const response = await fetch(
      `${API_URL}/admin/users/${userId}`,
      fetchOptions('DELETE', null, token)
    );
    return handleResponse(response);
  }
};

// Export the API instance for direct use
export const api = {
  auth: authService,
  products: productService,
  orders: orderService,
  users: userService
};
