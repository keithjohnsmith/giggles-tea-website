import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import productService from '../services/productService';
import { groupProductsByCategory } from '../utils/productUtils';
import EnhancedProductCard from '../components/EnhancedProductCard';
import { useCart } from '../context/CartContext';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState({ en: [], de: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { cartItems } = useCart();

  // Fetch products from the API
  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all products from the API with pagination
        const response = await productService.getAll({ 
          fetchAll: true, // Get all pages
          limit: 100, // Set a reasonable limit
          filters: { isActive: true } // Only fetch active products
        });
        
        if (!isMounted) return;
        
        // Extract products from the response
        const products = Array.isArray(response.products) ? response.products : [];
        setProducts(products);
        
        // Extract unique categories from products
        const uniqueCats = {};
        products.forEach(product => {
          // Try to get the category from category_en first, then category, then default to 'Uncategorized'
          const cat = product.category_en || product.category || 'Uncategorized';
          if (cat && !uniqueCats[cat]) {
            uniqueCats[cat] = true;
          }
        });
        
        const cats = {
          en: Object.keys(uniqueCats).sort(),
          de: Object.keys(uniqueCats).sort() // Using same for both languages for now
        };
        
        setCategories(cats);
        
        // Set initial selected categories from URL if any
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategories([categoryParam]);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        if (isMounted) {
          setError('Failed to load products. Please try again later.');
          setCategories({ en: [], de: [] });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
    
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Filter products based on search term and selected categories
  useEffect(() => {
    if (products.length === 0) return;
    
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.category_en && product.category_en.toLowerCase().includes(searchLower)) ||
        (product.category_de && product.category_de.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(cat => 
          (product.category_en && product.category_en === cat) || 
          (product.category_de && product.category_de === cat)
        )
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories]);

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
    }
  }, [searchParams]);

  // Toggle category selection
  const toggleCategory = (category) => {
    if (!category) return;
    
    setSelectedCategories(prev => {
      if (!Array.isArray(prev)) {
        return [category];
      }
      return prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is handled by the useEffect above
  };

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Sort categories with Ayurveda at the bottom
  const sortedCategories = useMemo(() => {
    if (!categories?.en) return [];
    // Create a copy of the array to avoid mutating the original
    const cats = [...categories.en];
    return cats.sort((a, b) => {
      if (a.toLowerCase() === 'ayurveda') return 1;
      if (b.toLowerCase() === 'ayurveda') return -1;
      return a.localeCompare(b);
    });
  }, [categories]);

  // Group products by category for the category view
  const productsByCategory = groupProductsByCategory(filteredProducts);

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Featured Products Carousel */}
        <div className="mb-16">
          <FeaturedProductsCarousel />
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 sm:text-4xl mb-4">
            Our Tea Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our premium selection of teas, carefully sourced and blended to perfection.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {selectedCategories.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>

          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                {(selectedCategories.length > 0 || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </form>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                <div className="space-y-2">
                  {sortedCategories.length > 0 ? (
                    sortedCategories.map((category, index) => (
                      <div key={`${category}-${index}`} className="flex items-center">
                        <input
                          id={`category-${index}`}
                          name="category"
                          type="checkbox"
                          checked={selectedCategories.includes(category) || 
                                   (categories.de[index] && selectedCategories.includes(categories.de[index]))}
                          onChange={() => toggleCategory(category)}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor={`category-${index}`} className="ml-3 text-sm text-gray-600">
                          {category}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40 lg:hidden">
                  <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsFilterOpen(false)} />
                </div>
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween' }}
                  className="fixed inset-y-0 left-0 z-50 w-5/6 max-w-sm bg-white shadow-xl overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="mobile-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <form onSubmit={handleSearch}>
                        <input
                          type="text"
                          id="mobile-search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search products..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </form>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                      <div className="space-y-2">
                        {sortedCategories.map((category) => {
                          const productCount = products.filter(p => 
                            p.category === category || 
                            p.category_en === category ||
                            p.category_de === category
                          ).length;
                          
                          return (
                            <div key={`mobile-${category}`} className="flex items-center">
                              <input
                                id={`mobile-category-${category}`}
                                name="mobile-category"
                                type="checkbox"
                                checked={selectedCategories.includes(category) || 
                                         (categories.de && categories.de[categories.en.indexOf(category)] && 
                                          selectedCategories.includes(categories.de[categories.en.indexOf(category)]))}
                                onChange={() => toggleCategory(category)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`mobile-category-${category}`} className="ml-3 text-sm text-gray-700">
                                {category} ({productCount})
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          clearFilters();
                          setIsFilterOpen(false);
                        }}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1">
            {/* Active filters */}
            {(selectedCategories.length > 0 || searchTerm) && (
              <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  
                  {selectedCategories.map((category) => (
                    <span
                      key={`active-${category}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="flex-shrink-0 ml-1.5 inline-flex h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      >
                        <span className="sr-only">Remove filter for {category}</span>
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  
                  {searchTerm && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Search: {searchTerm}
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="flex-shrink-0 ml-1.5 inline-flex h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      >
                        <span className="sr-only">Remove search term</span>
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Products grid grouped by category */}
            {filteredProducts.length > 0 ? (
              <div className="space-y-12">
                {Object.entries(
                  // Group products by category
                  groupProductsByCategory(filteredProducts)
                )
                // Sort categories alphabetically with Ayurveda at the bottom
                .sort(([categoryA], [categoryB]) => {
                  if (categoryA.toLowerCase() === 'ayurveda') return 1;
                  if (categoryB.toLowerCase() === 'ayurveda') return -1;
                  return categoryA.localeCompare(categoryB);
                })
                // Render each category section
                .map(([category, categoryProducts]) => {
                  // Sort products within category by name
                  const sortedProducts = [...categoryProducts].sort((a, b) => 
                    a.name.localeCompare(b.name)
                  );

                  return (
                    <div key={category} className="space-y-6">
                      <h2 className="text-2xl font-light text-gray-900 border-b border-gray-200 pb-2">
                        {category}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'})
                        </span>
                      </h2>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        {sortedProducts.map((product) => (
                          <motion.div 
                            key={product.id} 
                            variants={itemVariants}
                            className="h-full"
                          >
                            <EnhancedProductCard 
                              product={{
                                ...product,
                                // Ensure we have a fallback for required fields
                                name: product.name || 'Unnamed Product',
                                price: product.price || 0,
                                images: Array.isArray(product.images) 
                                  ? product.images 
                                  : product.image 
                                    ? [product.image] 
                                    : ['/images/placeholder-product.jpg']
                              }} 
                              isInCart={isProductInCart(product.id)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We couldn't find any products matching your criteria. Try adjusting your filters.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
