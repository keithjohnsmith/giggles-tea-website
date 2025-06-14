// Use absolute URL for API requests with explicit port 5000 to match server configuration
const API_URL = 'http://localhost:5000/api';

// Common fetch options
const fetchOptions = (method = 'GET', body = null, token = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // This is important for cookies
    mode: 'cors',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  return options;
};

// Helper function to handle responses
const handleResponse = async (response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  console.log('Response content type:', contentType);
  console.log('Response text:', text);
  
  // Try to parse as JSON if possible
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        console.error('API error response:', { status: response.status, data });
        const error = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
  }
  
  // If not JSON, handle as text
  console.error('Non-JSON response received:', { status: response.status, text });
  const error = new Error(text || 'Server returned an error');
  error.status = response.status;
  error.text = text;
  throw error;
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

// Helper function to fetch a single page of products
const fetchProductsPage = async (page = 1) => {
  const url = `${API_URL}/products?page=${page}`;
  console.log(`[productService] Fetching products page ${page} from: ${url}`);
  
  try {
    const response = await fetch(url, fetchOptions('GET'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[productService] Error fetching page ${page}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[productService] Successfully fetched ${data.products?.length || 0} products from page ${page}`);
    return data;
  } catch (error) {
    console.error(`[productService] Exception when fetching page ${page}:`, error);
    throw error;
  }
};

// Products API
export const productService = {
  getAll: async () => {
    try {
      console.log('[productService] Starting to fetch all products');
      
      // First fetch to get pagination info
      const firstPage = await fetchProductsPage(1);
      
      // If there's only one page, return the products
      if (!firstPage.pages || firstPage.pages <= 1) {
        console.log('[productService] Only one page of products found');
        return firstPage.products || [];
      }
      
      // Fetch all remaining pages in parallel
      console.log(`[productService] Fetching remaining ${firstPage.pages - 1} pages...`);
      const pagePromises = [];
      for (let page = 2; page <= firstPage.pages; page++) {
        pagePromises.push(fetchProductsPage(page));
      }
      
      const remainingPages = await Promise.all(pagePromises);
      
      // Combine all products
      const allProducts = [
        ...(firstPage.products || []),
        ...remainingPages.flatMap(page => page.products || [])
      ];
      
      console.log(`[productService] Fetched ${allProducts.length} products from ${firstPage.pages} pages`);
      return allProducts;
      
    } catch (error) {
      console.error('[productService] Error fetching products:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  getById: async (id) => {
    const response = await fetch(
      `${API_URL}/products/${id}`,
      fetchOptions('GET')
    );
    return handleResponse(response);
  },

  create: async (product, token) => {
    const response = await fetch(
      `${API_URL}/admin/products`,
      fetchOptions('POST', product, token)
    );
    return handleResponse(response);
  },

  update: async (id, product, token) => {
    const response = await fetch(
      `${API_URL}/admin/products/${id}`,
      fetchOptions('PUT', product, token)
    );
    return handleResponse(response);
  },

  delete: async (id, token) => {
    const response = await fetch(
      `${API_URL}/admin/products/${id}`,
      fetchOptions('DELETE', null, token)
    );
    return handleResponse(response);
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
