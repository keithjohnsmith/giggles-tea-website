import React from 'react';
// Base configuration for the application
export const config = {
  // API Configuration
  api: {
    // Base URL for API requests
    // In development, use the full URL to the PHP server
    // In production, use relative URL to the server
    baseUrl: import.meta.env.PROD ? '/api' : 'http://localhost/giggles-tea/api',
    
    // API endpoints - these are relative to baseUrl
    endpoints: {
      products: 'products',
      products_fixed: 'products_fixed',
      products_simple: 'products_simple',
      // Add other API endpoints here as needed
    },
    
    // Default fetch options
    fetchOptions: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin', // Changed from 'include' to 'same-origin' for development
      mode: 'cors',
      cache: 'no-cache',
    },
    
    // Helper function to get full API URL
    getApiUrl: function(endpoint, params = {}) {
      // Ensure base URL ends with a slash
      const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      const endpointPath = this.endpoints[endpoint].startsWith('/') 
        ? this.endpoints[endpoint].substring(1) 
        : this.endpoints[endpoint];
        
      // Create URL object with base and endpoint
      const url = new URL(endpointPath, base);
      
      // Filter out any undefined, null, or 'path' parameters
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && key !== 'path') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Add query parameters using URLSearchParams
      const searchParams = new URLSearchParams();
      Object.entries(cleanParams).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      
      // Append query string if we have parameters
      const queryString = searchParams.toString();
      if (queryString) {
        url.search = queryString;
      }
      
      // Log the final URL for debugging
      console.log('Constructed API URL:', url.toString());
      
      return url.toString();
    },
    
    // Helper function to handle API responses
    handleResponse: async function(response) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from server');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    },
    
    // Helper function to make API requests
    apiRequest: async function(endpoint, options = {}) {
      const url = this.getApiUrl(endpoint, options.params);
      console.log('Making API request to:', url);
      
      const fetchOptions = {
        ...this.fetchOptions,
        ...options,
        headers: {
          ...this.fetchOptions.headers,
          ...(options.headers || {})
        },
        // Ensure credentials are included for CORS
        credentials: 'include'
      };
      
      // Remove content-type for FormData
      if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
      } else if (options.body instanceof FormData) {
        delete fetchOptions.headers['Content-Type'];
      }
      
      try {
        const response = await fetch(url, fetchOptions);
        return await this.handleResponse(response);
      } catch (error) {
        console.error('API Request Error:', error);
        throw error;
      }
    }
  },
  
  // Image paths configuration
  images: {
    basePath: '/public/Tea Catalogue/',
    fallbackImage: '/images/placeholder-product.jpg', // Add a fallback image
  },
  
  // Feature flags
  features: {
    enableNewCheckout: false, // Example feature flag
  },
};

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The endpoint key or path
 * @param {Object} [params] - Query parameters as key-value pairs
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint, params = {}) => {
  // Create a clean copy of params without the 'path' parameter
  const cleanParams = { ...params };
  delete cleanParams.path; // Remove the path parameter if it exists
  
  // Get the base URL and ensure it doesn't have a trailing slash
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const path = config.api.endpoints[endpoint] || endpoint;
  
  // Create query string only with clean parameters
  const queryParams = [];
  Object.entries(cleanParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const fullUrl = `${baseUrl}/${path.replace(/^\//, '')}${queryString}`;
  
  console.log('Constructed API URL:', fullUrl);
  return fullUrl;
};

/**
 * Get the full URL for an image with robust path handling
 * @param {string} path - The image path from the database
 * @returns {string} Full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  
  // If it's already a full URL or data URI, return as is
  if (path.match(/^(https?:|data:|\/\/)/i) || path.startsWith('blob:')) {
    return path;
  }
  
  // Normalize the path - handle both forward and backslashes
  let normalizedPath = path.replace(/\\/g, '/');
  
  // Decode any URL-encoded characters (like %20 for spaces)
  try {
    normalizedPath = decodeURIComponent(normalizedPath);
  } catch (e) {
    console.warn('Error decoding image path:', e);
  }
  
  // Remove any leading slashes or dots to prevent path traversal
  normalizedPath = normalizedPath.replace(/^[\/\.]+/, '');
  
  // Remove any 'Tea Catalogue' or 'Tea%20Catalogue' from the path to prevent duplication
  normalizedPath = normalizedPath.replace(/^tea\s*catalogue\//i, '');
  
  // Split the path into parts
  const parts = normalizedPath.split('/').filter(Boolean);
  
  // If the first part is a number, assume it's a product ID
  if (parts.length > 0 && /^\d+$/.test(parts[0])) {
    const productId = parts[0];
    const filename = parts.slice(1).join('/');
    return `/image.php?path=${encodeURIComponent(`${productId}/${filename}`)}`;
  } 
  
  // Otherwise, use the path as is
  return `/image.php?path=${encodeURIComponent(normalizedPath)}`;
};

export default config;
