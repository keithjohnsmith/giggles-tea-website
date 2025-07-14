import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import ProductForm from '../../components/admin/ProductForm';
import React from 'react';
import { productService } from '../../services/api';
import { toast } from 'react-toastify';

// Helper function to handle API requests using the product service
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const id = endpoint.split('/').pop();
    
    switch (method) {
      case 'GET':
        if (id && id !== 'products') {
          console.log('Fetching product by ID:', id);
          return await productService.getById(id);
        } else {
          console.log('Fetching all products');
          // Use productService.getAll directly with the correct parameters
          return await productService.getAll({ 
            page: 1, 
            limit: 100,
            // Add any other required parameters here
          });
        }
      case 'POST':
        console.log('Creating product:', data);
        return await productService.create(data);
      case 'PUT':
        console.log('Updating product:', id, data);
        return await productService.update(id, data);
      case 'DELETE':
        console.log('Deleting product:', id);
        await productService.delete(id);
        return { success: true };
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error('API request failed:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(errorMessage);
    throw error;
  }
}

// Function to export products to a downloadable JSON file
const exportProducts = () => {
  try {
    // Create a blob from the products array
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = 'products_export_' + new Date().toISOString().split('T')[0] + '.json';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    alert('Products exported successfully! Please replace the products.json file with this exported file.');
  } catch (error) {
    console.error('Error exporting products:', error);
    alert('Error exporting products: ' + error.message);
  }
};

// Initial empty product template with proper defaults matching the database schema
const emptyProduct = {
  id: null,
  name: '',
  german_name: '',
  category: 'Schwarzer Tee',
  category_en: 'Black Tea',
  category_id: null,
  price: 0,
  description: '',
  german_description: '',
  ingredients: '',
  german_ingredients: '',
  preparation: '',
  german_preparation: '',
  origin: '',
  caffeine: '',
  in_stock: true,
  is_active: true,
  images: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Available categories for dropdown
const categories = [
  { de: 'Schwarzer Tee', en: 'Black Tea' },
  { de: 'Grüner Tee', en: 'Green Tea' },
  { de: 'Weißer Tee', en: 'White Tea' },
  { de: 'Oolong Tee', en: 'Oolong Tea' },
  { de: 'Kräutertee', en: 'Herbal Tea' },
  { de: 'Früchtetee', en: 'Fruit Tea' },
  { de: 'Rooibos', en: 'Rooibos' },
  { de: 'Ayurveda', en: 'Ayurveda' },
  { de: 'Sonstiges', en: 'Other' }
];

export default function Products() {
  // Pagination state - moved to top
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    showPagination: false
  });
  const { currentPage, itemsPerPage, totalItems, totalPages, showPagination } = pagination;
  
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyProduct });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update pagination state helper
  const updatePagination = (updates) => {
    console.log('Updating pagination:', updates);
    setPagination(prev => {
      const updated = { ...prev, ...updates };
      // Recalculate total pages when relevant values change
      if (updates.totalItems !== undefined || updates.itemsPerPage !== undefined) {
        const items = updates.totalItems !== undefined ? updates.totalItems : prev.totalItems;
        const perPage = updates.itemsPerPage !== undefined ? updates.itemsPerPage : prev.itemsPerPage;
        updated.totalPages = Math.max(1, Math.ceil(items / perPage));
        console.log('Recalculated totalPages:', { items, perPage, totalPages: updated.totalPages });
      }
      // Update showPagination based on products and loading state
      updated.showPagination = (updated.totalItems > 0 || products.length > 0) || isLoading;
      console.log('Updated pagination state:', updated);
      return updated;
    });
  };

  // Handle product edit
  const handleEdit = (product) => {
    console.log('Editing product:', product);
    
    // Process images to ensure they have the correct format
    const processImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      
      return images.map(img => {
        // If image is a string (filename), convert to object with URL
        if (typeof img === 'string') {
          // Extract just the filename from the path
          const filename = img.split('/').pop();
          return {
            id: img,
            url: `${import.meta.env.VITE_API_URL}/Tea%20Catalogue/${product.id}/${filename}`,
            filename: filename,
            isNew: false
          };
        }
        
        // If image is an object but missing URL, construct it
        if (img && !img.url && img.filename) {
          // Extract just the filename from the path if it's a full path
          const filename = img.filename.includes('/') 
            ? img.filename.split('/').pop() 
            : img.filename;
            
          return {
            ...img,
            url: `${import.meta.env.VITE_API_URL}/Tea%20Catalogue/${product.id}/${filename}`,
            filename: filename,
            isNew: false
          };
        }
        
        // Ensure isNew is set for existing images
        return {
          ...img,
          isNew: false
        };
      });
    };
    
    const processedProduct = {
      ...product,
      // Ensure images is always an array and processed
      images: processImages(product.images || [])
    };
    
    console.log('Processed product for editing:', processedProduct);
    setEditingProduct(processedProduct);
    setIsEditing(true);
    // Scroll to top for better UX when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
  };

  // Handle add new product
  const handleAddNew = () => {
    console.log('Adding new product');
    const newProduct = {
      ...emptyProduct,
      id: null,
      name: '',
      german_name: '',
      price: 0,
      description: '',
      categories: [],
      is_active: true,
      images: []
    };
    console.log('New product data:', newProduct);
    setEditingProduct(newProduct);
    setIsEditing(true);
    // Scroll to top for better UX when adding a new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle save product changes
  const handleSaveProduct = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use relative path that will be proxied by Vite
      const endpoint = '/api/products.php';
      const method = 'POST'; // Always use POST since PATCH isn't supported
      
      console.log(`Saving product via ${method} to:`, endpoint);
      
      // Convert FormData to a plain object
      const formDataObj = {};
      const categories = [];
      
      // First, extract all fields from FormData
      for (let [key, value] of formData.entries()) {
        // Handle categories array
        if (key.startsWith('categories[')) {
          try {
            const category = JSON.parse(value);
            categories.push(category);
          } catch (e) {
            console.error('Failed to parse category:', value);
          }
        } else {
          formDataObj[key] = value;
        }
      }
      
      // Add categories array to the form data
      if (categories.length > 0) {
        formDataObj.categories = categories;
      }

      // If we're updating, ensure the ID is in the request body
      if (editingProduct?.id) {
        formDataObj.id = editingProduct.id;
      }
      
      // Build the URL with query parameters
      let url = endpoint;
      const params = new URLSearchParams();
      
      if (editingProduct?.id) {
        params.append('id', editingProduct.id);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Request URL:', url);
      console.log('Request method:', method);
      console.log('Request data:', formDataObj);
      
      // Clone the request options to avoid modifying the original
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formDataObj),
        credentials: 'include',
        mode: 'cors',
      };
      
      console.log('Sending request with options:', JSON.stringify(requestOptions, null, 2));
      
      const response = await fetch(url, requestOptions);
      
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (e) {
        const text = await response.text();
        console.error('Failed to parse JSON response:', text);
        throw new Error(`Failed to parse response: ${text}`);
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Failed to save product: ${response.status} ${response.statusText}`);
      }
      
      console.log('Save successful, response:', responseData);
      
      // Show success message
      alert(`Product ${editingProduct?.id ? 'updated' : 'created'} successfully!`);
      
      // Fetch fresh data to ensure we have the latest state
      await fetchProducts(currentPage);
      
      // Reset form
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products with pagination
  const fetchProducts = async (page = 1) => {
    try {
      console.log('Setting loading to true');
      setIsLoading(true);
      console.log('Fetching products for page:', page, 'with limit:', itemsPerPage);
      
      // Clear any previous errors
      setError(null);
      
      // Build the URL with pagination parameters
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const url = new URL(`${baseUrl}/products.php`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', itemsPerPage);
      url.searchParams.append('getTotal', '1');
      
      // If there's a search term, add it to the URL
      if (searchTerm && searchTerm.trim() !== '') {
        console.log('Adding search term to URL:', searchTerm);
        url.searchParams.append('search', searchTerm);
      }
      console.log('Fetching from URL:', url.toString());
      
      // Fetch products from the API with pagination
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      let productsData = [];
      let totalItems = 0;
      
      // Log the full response structure for debugging
      console.log('Full API response structure:', JSON.stringify(data, null, 2));
      
      // Handle different response formats
      if (data.data && data.data.data && Array.isArray(data.data.data)) {
        console.log('Found products array in data.data.data');
        productsData = data.data.data;
        totalItems = data.data.pagination?.total || data.data.total || 0;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Found products array in data.data');
        productsData = data.data;
        totalItems = data.pagination?.total || data.total || productsData.length;
      } else if (data.products) {
        console.log('Found products in data.products');
        productsData = data.products;
        totalItems = data.pagination?.total || data.total || productsData.length;
      } else if (Array.isArray(data)) {
        console.log('Response is a direct array');
        productsData = data;
        totalItems = data.length;
      } else {
        console.log('No products array found in response, using empty array');
        productsData = [];
        totalItems = 0;
      }
      
      console.log('Extracted products data:', {
        productsCount: productsData.length,
        totalItems,
        firstProduct: productsData[0] || 'No products'
      });
      
      console.log(`Processed ${productsData.length} products, total items: ${totalItems}`);
      
      // Transform the data to match our expected format
      const transformedProducts = productsData.map(product => {
        if (!product) return null;
        
        // Process images to ensure they have full URLs
        const processImages = (images) => {
          if (!images || !Array.isArray(images)) return [];
          return images.map(img => {
            if (!img) return null;
            
            // If image is a string (filename), convert to object with URL
            if (typeof img === 'string') {
              return {
                id: img,
                url: `${import.meta.env.VITE_API_URL}/Tea%20Catalogue/${product.id}/${img}`,
                filename: img
              };
            }
            
            // If image is an object but missing URL, construct it
            if (img && !img.url && img.filename) {
              return {
                ...img,
                url: `${import.meta.env.VITE_API_URL}/Tea%20Catalogue/${product.id}/${img.filename}`
              };
            }
            
            // If image has a relative URL, make it absolute
            if (img && img.url && !img.url.startsWith('http') && !img.url.startsWith('data:')) {
              return {
                ...img,
                url: `${import.meta.env.VITE_API_URL}${img.url.startsWith('/') ? '' : '/'}${img.url}`
              };
            }
            
            return img;
          }).filter(Boolean); // Remove any null/undefined entries
        };
        
        // Log each product being transformed for debugging
        const transformed = {
          id: product.id,
          name: product.name || '',
          german_name: product.german_name || '',
          price: parseFloat(product.price) || 0,
          description: product.description || '',
          category: product.category || '',
          category_en: product.category_en || '',
          category_id: parseInt(product.category_id) || 0,
          categories: product.categories || [],
          images: processImages(product.images || []),
          image: product.image || '',
          is_active: product.is_active !== undefined ? product.is_active : true
        };
        
        console.log('Transformed product:', { 
          id: transformed.id, 
          name: transformed.name,
          originalData: product,
          transformedData: transformed
        });
        
        return transformed;
      }).filter(Boolean); // Remove any null entries
      
      // Calculate total pages
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      const totalPagesFromApi = data.data?.pagination?.pages || calculatedTotalPages;
      const finalTotalPages = Math.max(1, totalPagesFromApi || 1);
      
      console.log('Pagination details:', {
        totalItems,
        itemsPerPage,
        calculatedTotalPages,
        totalPagesFromApi,
        finalTotalPages
      });
      
      // Log the transformed products for debugging
      console.log('Transformed products:', transformedProducts);
      
      // Update products state with the new page of products
      setProducts(prevProducts => {
        console.log('Previous products:', prevProducts);
        console.log('New products to set:', transformedProducts);
        return transformedProducts;
      });
      
      // Update pagination state
      updatePagination({
        currentPage: page,
        totalItems: parseInt(totalItems),
        totalPages: finalTotalPages,
        itemsPerPage: parseInt(itemsPerPage),
        showPagination: transformedProducts.length > 0 || page > 1
      });
      
      console.log('Products and pagination updated:', {
        currentPage: page,
        totalItems,
        totalPages: finalTotalPages,
        itemsPerPage,
        productsCount: transformedProducts.length
      });
      
      if (transformedProducts.length === 0) {
        console.warn('No products found in the API response');
        if (page > 1) {
          // If we're on a page with no results but there are results, go to the last page
          const lastPage = Math.max(1, finalTotalPages);
          if (lastPage !== page) {
            console.log(`No products on page ${page}, navigating to last page ${lastPage}`);
            handlePageChange(lastPage);
          }
        }
        toast.warning('No products found for the current page.');
      }
      
      return transformedProducts;
      
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error.message || 'Failed to load products';
      setError(errorMessage);
      setProducts([]);
      updatePagination({
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        showPagination: false
      });
      toast.error(`Error loading products: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load products when component mounts or when page changes
  useEffect(() => {
    console.log('Fetching products...', { currentPage, itemsPerPage, totalItems });
    fetchProducts(currentPage);
  }, [currentPage]);
  
  // Debug: Log pagination state
  useEffect(() => {
    console.log('Pagination State:', {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      hasProducts: products.length > 0
    });
  }, [currentPage, itemsPerPage, totalItems, totalPages, products]);

  // Log products state when it changes
  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Filter products based on search term (client-side filtering only if search term exists)
  const filteredProducts = searchTerm 
    ? products.filter((product) => {
        if (!product) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
          (product.name && product.name.toLowerCase().includes(searchLower)) ||
          (product.german_name && product.german_name.toLowerCase().includes(searchLower)) ||
          (product.category && product.category.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.id && product.id.toString().includes(searchTerm))
        );
      })
    : products; // If no search term, show all products from the current page

  // Update pagination when products or loading state changes
  useEffect(() => {
    console.log('Products or loading state changed, updating pagination...');
    updatePagination({
      showPagination: products.length > 0 || isLoading
    });
  }, [products.length, isLoading]);
  
  // Handle search input change with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only trigger a new fetch if we have a search term or if we're clearing the search
      fetchProducts(1); // Always reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    console.log('handlePageChange called with page:', newPage, 'currentPage:', currentPage, 'totalPages:', totalPages);
    
    // Ensure we have a valid number
    const page = Number(newPage);
    if (isNaN(page)) {
      console.error('Invalid page number:', newPage);
      return;
    }
    
    // Check if the page is within valid range
    if (page < 1 || page > totalPages) {
      console.warn('Page out of range:', page, 'valid range: 1 to', totalPages);
      return;
    }
    
    // Don't do anything if we're already on this page
    if (page === currentPage) {
      console.log('Already on page', page, '- ignoring');
      return;
    }
    
    console.log('Changing to page:', page);
    
    // Update the current page in the pagination state immediately
    setPagination(prev => {
      console.log('Updating pagination state - currentPage from', prev.currentPage, 'to', page);
      return {
        ...prev,
        currentPage: page
      };
    });
    
    // Then fetch the products for the new page
    console.log('Fetching products for page:', page);
    fetchProducts(page);
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show max 5 page numbers at a time

    if (totalPages <= maxVisiblePages) {
      // If total pages are less than max visible pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of the visible range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Render the edit form if in edit mode
  if (isEditing) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm
          product={editingProduct || emptyProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelEdit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    );
  }

  // Render the products list if not in edit mode
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all products in your inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-wrap gap-3">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-gray-300 pl-4 pr-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name (EN/DE)
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price (USD)
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {product.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-gray-500">{product.german_name}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-900">{product.category}</div>
                            <div className="text-gray-500">{product.category_en}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ${product.price.toFixed(2)} USD
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Edit {product.name}</span>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Delete {product.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination - Show if we have products, or are loading, or have multiple pages */}
            {(showPagination || totalPages > 1) && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {totalItems > 0 ? (
                        <>
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                          </span>{' '}
                          of <span className="font-medium">{totalItems}</span> results
                        </>
                      ) : (
                        'No results found'
                      )}
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={(e) => {
                          console.log('Previous button clicked:', { currentPage, totalPages, event: e });
                          if (currentPage > 1) {
                            console.log('Calling handlePageChange with page:', currentPage - 1);
                            handlePageChange(currentPage - 1);
                          }
                        }}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            console.log('Page button clicked:', { page, currentPage, totalPages, event: e });
                            if (typeof page === 'number') {
                              console.log('Calling handlePageChange with page:', page);
                              handlePageChange(page);
                            }
                          }}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'}
                            ${page === '...' ? 'cursor-default' : ''}`}
                          disabled={page === '...'}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={(e) => {
                          console.log('Next button clicked:', { currentPage, totalPages, event: e });
                          if (currentPage < totalPages) {
                            console.log('Calling handlePageChange with page:', currentPage + 1);
                            handlePageChange(currentPage + 1);
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          English Name *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="germanName" className="block text-sm font-medium text-gray-700">
                          German Name *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="germanName"
                            id="germanName"
                            required
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.germanName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category (DE) *
                        </label>
                        <div className="mt-1">
                          <select
                            name="category"
                            id="category"
                            required
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.category}
                            onChange={(e) => {
                              const selected = categories.find(cat => cat.de === e.target.value);
                              setFormData({
                                ...formData,
                                category: e.target.value,
                                category_en: selected ? selected.en : formData.category_en
                              });
                            }}
                          >
                            {categories.map((cat) => (
                              <option key={cat.de} value={cat.de}>
                                {cat.de} / {cat.en}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="category_en" className="block text-sm font-medium text-gray-700">
                          Category (EN) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="category_en"
                            id="category_en"
                            required
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.category_en}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price (USD) *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            min="0"
                            step="0.01"
                            required
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleInputChange}
                            aria-describedby="price-currency"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm" id="price-currency">USD</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-3 flex items-center">
                        <div className="flex items-center h-5">
                          <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="isActive" className="font-medium text-gray-700">
                            Active
                          </label>
                          <p className="text-gray-500">Product is visible to customers</p>
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.description}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
