import React, { useState, useEffect, useRef, useMemo } from 'react';
import { productService } from '../services/api';
import ProductsCarousel from '../components/Products';
import { useCart } from '../context/CartContext';
import AddToCartNotification from '../components/AddToCartNotification';
import { FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';

// Helper function to format category names for display
const formatCategoryName = (category) => {
  // Remove 'tea-bag-mixbox-' prefix if present
  let formatted = category.replace(/^tea-bag-mixbox-/, '');
  // Replace hyphens with spaces
  formatted = formatted.replace(/-/g, ' ');
  // Capitalize first letter of each word
  return formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get the main category from the category string
const getMainCategory = (category) => {
  // Normalize the category by converting to lowercase and trimming
  const normalized = category.toLowerCase().trim();
  
  // Map of category patterns to their display names
  const categoryMap = {
    'tea bag mixbox': 'Tea Bag Mixbox',
    'green tea': 'Green Tea',
    'black tea$': 'Black Tea',  // $ ensures exact match for 'black tea' but not 'black tea blend'
    'black tea blend': 'Black Tea Blend',
    'rooibos tea': 'Rooibos Tea',
    'fruit tea blend': 'Fruit Tea Blend',
    'half fermented tea - china': 'Half Fermented Tea - China',
    'herb tea blend': 'Herb Tea Blend',
    'herb tea': 'Herb Tea',
  };
  
  // Try exact matches first
  for (const [pattern, displayName] of Object.entries(categoryMap)) {
    if (normalized === pattern.toLowerCase()) {
      return displayName;
    }
  }
  
  // Try partial matches as fallback
  for (const [pattern, displayName] of Object.entries(categoryMap)) {
    if (normalized.includes(pattern.toLowerCase())) {
      return displayName;
    }
  }
  
  // Default to the original category if no match found
  return category;
};

const ProductCard = ({ product, onAddToCart, isClicked, formatCategoryName }) => {
  const [currentImage, setCurrentImage] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const descriptionRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const imageRef = useRef(null);

  // Set initial image
  useEffect(() => {
    if (product.image_1) {
      const img = new Image();
      img.src = product.image_1;
      img.onload = () => {
        setCurrentImage(product.image_1);
        setIsImageLoaded(true);
      };
      img.onerror = () => {
        // If primary image fails, try fallback
        if (product.image_2) {
          const fallbackImg = new Image();
          fallbackImg.src = product.image_2;
          fallbackImg.onload = () => {
            setCurrentImage(product.image_2);
            setIsImageLoaded(true);
          };
        }
      };
    }
  }, [product.image_1, product.image_2]);

  // Check if text is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextTruncated = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight || 
                             descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth;
      setIsTruncated(isTextTruncated);
    }
  }, [product.description]);

  const handleMouseEnter = () => {
    if (product.image_2 && currentImage !== product.image_2) {
      const img = new Image();
      img.src = product.image_2;
      img.onload = () => {
        setCurrentImage(product.image_2);
      };
    }
  };

  const handleMouseLeave = () => {
    if (product.image_1 && currentImage !== product.image_1) {
      setCurrentImage(product.image_1);
    }
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mx-2 my-4 h-full flex flex-col"
    >
      <div 
        className="aspect-square mb-6 rounded-lg overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isImageLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <img 
            ref={imageRef}
            src={currentImage}
            alt={product.product_name || 'Product image'}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300 p-4"
            onError={(e) => {
              e.target.onerror = null;
              // Show placeholder on error
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDFkMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAxM0g2YTUgNSAwIDAgMC03IDlIMjBhNSA1IDAgMCAwLTUtNXoiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
              e.target.className = 'w-full h-full bg-gray-100 p-12';
            }}
          />
        )}
      </div>
      <div className="flex-grow px-1">
        <div className="text-sm text-gray-500 mb-1">
          {formatCategoryName(product.category)}
        </div>
        <h3 className="text-xl font-medium mb-1 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        <div className="relative">
          <p 
            ref={descriptionRef}
            className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem] relative group"
            onMouseEnter={() => isTruncated && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label={product.description}
          >
            {product.description}
            {isTruncated && (
              <span className="absolute bottom-0 right-0 bg-white pl-1 text-gray-400">...</span>
            )}
          </p>
          {isTruncated && showTooltip && (
            <div 
              className="absolute z-10 w-64 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg"
              role="tooltip"
            >
              {product.description}
              <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <button 
            onClick={() => onAddToCart(product)}
            className={`
              bg-gray-900 text-white px-4 py-2 rounded-md
              transition-all duration-200 ease-in-out
              hover:bg-gray-800
              ${isClicked ? 'scale-90' : 'scale-100'}
            `}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { addToCart } = useCart();
  const [notification, setNotification] = useState({ show: false, productName: '' });
  const [clickedId, setClickedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Process and filter products
  const { filteredProducts, categories, productsByCategory, totalPages, currentItems } = useMemo(() => {
    if (!products.length) return { filteredProducts: [], categories: [], productsByCategory: {}, totalPages: 0, currentItems: [] };
    
    // Process all products
    const allCategories = new Set();
    const processedProducts = [];
    
    products.forEach(product => {
      if (!product.isActive) return;
      
      const category = getMainCategory(product.category);
      allCategories.add(category);
      
      // Process image paths to handle both local and remote images
      const getImagePath = (imageName) => {
        if (!imageName) return '';
        
        // If it's already a full URL, return it as is
        if (imageName.startsWith('http') || imageName.startsWith('data:')) {
          return imageName;
        }
        
        // Remove any leading slashes or paths, just get the filename
        const cleanName = imageName.split('/').pop().split('\\').pop();
        
        // First try to import directly (for Vite/Webpack)
        try {
          const imageModule = import.meta.glob('/src/assets/*', { eager: true });
          const imagePath = Object.keys(imageModule).find(path => 
            path.endsWith(cleanName)
          );
          if (imagePath) {
            return imageModule[imagePath].default;
          }
        } catch (e) {
          console.warn(`Could not import image module: ${cleanName}`, e);
        }
        
        // Fallback to URL resolution - ensure we're using the correct base path
        try {
          // Try with /assets/ first (public directory)
          const publicUrl = `/assets/${cleanName}`;
          // Then fall back to /src/assets/ if needed
          return new URL(publicUrl, window.location.origin).href;
        } catch (e) {
          console.warn(`Could not resolve image URL: ${cleanName}`, e);
        }
        
        // If all else fails, return the original path
        return imageName;
      };

      // Get the best available image, falling back through the chain
      const primaryImage = product.image_1 || product.image;
      const secondaryImage = product.image_2 || primaryImage;

      processedProducts.push({
        ...product,
        name: product.name || product.product_name,
        category,
        // Use direct imports for images
        image: getImagePath(primaryImage),
        image_1: getImagePath(primaryImage),
        image_2: getImagePath(secondaryImage),
        searchText: `${product.name || ''} ${product.product_name || ''} ${product.description || ''} ${category || ''}`.toLowerCase()
      });
    });
    
    // Apply filters
    let result = [...processedProducts];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.searchText.includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Pagination
    const totalPages = Math.ceil(result.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = result.slice(indexOfFirstItem, indexOfLastItem);
    
    // Group by category for display
    const productsByCategory = currentItems.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
    
    return {
      filteredProducts: result,
      categories: ['All', ...Array.from(allCategories).sort()],
      productsByCategory,
      totalPages,
      currentItems
    };
  }, [products, selectedCategory, searchQuery, currentPage, itemsPerPage]);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);
  
  const sortedCategories = Object.keys(productsByCategory).sort();
  
  // Fetch products from the backend with pagination support
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching products from API...');
        
        // This will now fetch all pages and return a flat array of products
        const productsData = await productService.getAll();
        
        if (!productsData || !Array.isArray(productsData)) {
          throw new Error('Invalid products data received');
        }
        
        console.log(`Successfully fetched ${productsData.length} products`);
        
        // Log active/inactive counts
        const activeCount = productsData.filter(p => p.isActive !== false).length;
        console.log(`Active products: ${activeCount}/${productsData.length} (${(activeCount/productsData.length*100).toFixed(1)}%)`);
        
        // Log categories and counts
        const categoryCounts = productsData.reduce((acc, product) => {
          const category = getMainCategory(product.category);
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        console.log('Products by category:', categoryCounts);
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        const errorMessage = error.message 
          ? `Error: ${error.message}`
          : 'Failed to load products. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      // Ensure price is a number for the cart
      price: parseFloat(product.price) || 0
    });
    setClickedId(product._id);
    setNotification({ show: true, productName: product.name });
    
    // Reset button animation
    setTimeout(() => {
      setClickedId(null);
    }, 200);
    
    // Hide notification
    setTimeout(() => {
      setNotification({ show: false, productName: '' });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Featured Products Carousel */}
      <div className="bg-gray-50">
        <ProductsCarousel />
      </div>

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Our Tea Collection</h1>
            <p className="text-lg text-gray-600">Discover our premium selection of teas</p>
          </div>
          
          {/* Filters and Search */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Mobile filter button */}
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                <FiFilter />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* Search */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              {/* Category Filter - Desktop */}
              <div className="hidden md:block">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {['All', ...sortedCategories].map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Mobile Category Filter */}
            {showMobileFilters && (
              <div className="mt-4 md:hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', ...sortedCategories].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm rounded-md text-center ${
                        selectedCategory === category 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {/* Categories and Products */}
          {filteredProducts.length > 0 ? (
            <div className="space-y-16">
              {sortedCategories.map((category) => (
                <section key={category} className="mb-16">
                  {/* Category Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-medium text-gray-900 inline-block relative pb-2">
                      {category}
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-900"></span>
                    </h2>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {productsByCategory[category].map((product) => (
                      <ProductCard 
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        isClicked={clickedId === product._id}
                        formatCategoryName={formatCategoryName}
                      />
                    ))}
                  </div>
                </section>
              ))}
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="mt-16">
                  <div className="flex items-center justify-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                      aria-label="Previous page"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                      <span className="ml-1 hidden sm:inline">Previous</span>
                    </button>

                    {/* First Page */}
                    {currentPage > 3 && totalPages > 5 && (
                      <>
                        <button
                          onClick={() => paginate(1)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            currentPage === 1
                              ? 'bg-gray-900 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-1 text-gray-400">...</span>
                        )}
                      </>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-gray-900 text-white transform scale-105 shadow-md'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Last Page */}
                    {currentPage < totalPages - 2 && totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-1 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => paginate(totalPages)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            currentPage === totalPages
                              ? 'bg-gray-900 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next Button */}
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                      aria-label="Next page"
                    >
                      <span className="mr-1 hidden sm:inline">Next</span>
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <AddToCartNotification 
        show={notification.show} 
        productName={notification.productName} 
      />
    </div>
  );
};

export default Products;