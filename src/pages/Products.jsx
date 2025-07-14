import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import productService from '../services/productService';
import ProductsCarousel from '../components/Products';
import { useCart } from '../context/CartContext';
import AddToCartNotification from '../components/AddToCartNotification';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';

/**
 * Formats a category name for display by removing prefixes, replacing hyphens with spaces,
 * and capitalizing each word.
 * @param {string} category - The category name to format
 * @returns {string} The formatted category name
 */
const formatCategoryName = (category) => {
  // Handle undefined or null category
  if (!category) return 'Uncategorized';
  
  // Convert to string in case it's not
  let formatted = String(category);
  
  // Remove 'tea-bag-mixbox-' prefix if present
  formatted = formatted.replace(/^tea-bag-mixbox-/, '');
  
  // Replace hyphens with spaces
  formatted = formatted.replace(/-/g, ' ').trim();
  
  // If empty after processing
  if (!formatted) return 'Uncategorized';
  
  // Capitalize first letter of each word
  return formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Gets the main category from a category string by normalizing and matching against known patterns.
 * @param {string} category - The category string to process
 * @returns {string|null} The display name of the main category or null if invalid
 */
const getMainCategory = (category) => {
  // If category is falsy, return null to indicate no category
  if (!category) return null;
  
  // Normalize the category by converting to string, lowercase and trimming
  const normalized = String(category).trim();
  
  // If category is empty after normalization, return null
  if (!normalized) return null;
  
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
  
  const lowerNormalized = normalized.toLowerCase();
  
  // Try exact matches first (case insensitive)
  for (const [pattern, displayName] of Object.entries(categoryMap)) {
    if (lowerNormalized === pattern.toLowerCase()) {
      return displayName;
    }
  }
  
  // Try partial matches as fallback
  for (const [pattern, displayName] of Object.entries(categoryMap)) {
    if (lowerNormalized.includes(pattern.toLowerCase())) {
      return displayName;
    }
  }
  
  // If we have a category but it's not in our map, return it as-is
  return normalized;
};

/**
 * ProductCard component that displays a single product with image, description, and add to cart button.
 * Handles image loading states and fallbacks.
 * @param {Object} props - Component props
 * @param {Object} props.product - The product data to display
 * @param {Function} props.onAddToCart - Callback when add to cart is clicked
 * @param {boolean} props.isClicked - Whether this product was recently added to cart
 * @param {Function} props.formatCategoryName - Function to format category names
 * @returns {JSX.Element} The rendered product card
 */
const ProductCard = ({ product, onAddToCart, isClicked, formatCategoryName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const descriptionRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Define the path to the placeholder image using a relative path from public
  const PLACEHOLDER_IMAGE = '/placeholder-product.jpg';
  
  // Get the images array, fallback to using image and image_2 if not available
  const images = product.images || [
    product.image,
    product.image_2
  ].filter(Boolean);
  
  // Get the hover image if available
  const [hasValidHoverImage, setHasValidHoverImage] = useState(!!product.hoverImage);
  
  // Handle hover image error
  const handleHoverImageError = () => {
    console.warn('Failed to load hover image:', product.hoverImage);
    setHasValidHoverImage(false);
  };
  
  // Preload hover image on component mount
  useEffect(() => {
    if (product.hoverImage) {
      const img = new Image();
      img.src = product.hoverImage;
      img.onerror = handleHoverImageError;
    }
  }, [product.hoverImage]);
  
  // Ensure we always have at least the placeholder image
  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  
  // Handle next/previous image
  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex >= displayImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [displayImages.length]);
  
  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex <= 0 ? displayImages.length - 1 : prevIndex - 1
    );
  }, [displayImages.length]);
  
  // Auto-rotate images when hovered (only if no hoverImage is available)
  useEffect(() => {
    let interval;
    if (isHovered && displayImages.length > 1 && !hoverImage) {
      interval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isHovered, nextImage, displayImages.length, hoverImage]);
  
  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const diff = touchStart - touchEnd;
    
    // Minimum swipe distance to trigger image change
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Set initial image and preload hover image if available
  useEffect(() => {
    if (displayImages.length > 0) {
      const img = new Image();
      const imageUrl = displayImages[0];
      
      // Skip if already loaded or if it's the placeholder
      if (imageUrl === PLACEHOLDER_IMAGE) {
        setIsImageLoaded(true);
        return;
      }
      
      img.src = imageUrl;
      
      // Preload hover image if available
      if (hoverImage) {
        const hoverImg = new Image();
        hoverImg.src = hoverImage;
      }
      
      img.onload = () => {
        console.log(`✅ Successfully loaded image: ${imageUrl}`);
        setIsImageLoaded(true);
      };
      
      img.onerror = (e) => {
        console.warn(`❌ Error loading image (${imageUrl}):`, e);
        // Update the image source to use the placeholder
        const imgElements = document.querySelectorAll(`img[src="${imageUrl}"]`);
        imgElements.forEach(el => {
          el.src = PLACEHOLDER_IMAGE;
        });
        setIsImageLoaded(true);
      };
    } else {
      // If no images, use the placeholder
      setIsImageLoaded(true);
    }
  }, [displayImages]);
  
  // Check if description is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      const isTextTruncated = element.scrollHeight > element.clientHeight || 
                             element.scrollWidth > element.clientWidth;
      setIsTruncated(isTextTruncated);
    }
  }, [product.description]);

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart(product);
  };

  // Toggle tooltip visibility
  const toggleTooltip = (e, show) => {
    e.stopPropagation();
    setShowTooltip(show);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Carousel */}
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-50 aspect-square group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hover image (loose leaf) */}
        {hasValidHoverImage && (
          <div 
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <img
              src={product.hoverImage}
              alt={`${product.name} - Hover`}
              className="w-full h-full object-contain p-4"
              onError={handleHoverImageError}
              loading="lazy"
            />
          </div>
        )}
        
        {/* Loading indicator */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
          </div>
        )}
        
        {/* Main Image */}
        <img
          src={displayImages[currentImageIndex] || PLACEHOLDER_IMAGE}
          alt={`${product.name} - ${currentImageIndex + 1} of ${displayImages.length}`}
          className={`absolute top-0 left-0 w-full h-full object-contain p-4 transition-opacity duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered && hasValidHoverImage ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => {
            console.log(`Image loaded: ${displayImages[currentImageIndex]}`);
            setIsImageLoaded(true);
          }}
          onError={(e) => {
            const failedSrc = e.target.src;
            console.error(`Failed to load image: ${failedSrc}`);
            if (failedSrc !== PLACEHOLDER_IMAGE) {
              e.target.src = PLACEHOLDER_IMAGE;
              // Force a re-render to ensure placeholder is shown
              setIsImageLoaded(false);
              setTimeout(() => setIsImageLoaded(true), 50);
            }
          }}
          loading="lazy"
        />
        
        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-indigo-600 rounded-full p-2 shadow-md z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-lg hover:scale-110"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-indigo-600 rounded-full p-2 shadow-md z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-lg hover:scale-110"
              aria-label="Next image"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Dots Navigation */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-blue-800 w-4' : 'bg-white/50'}`}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentImageIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <span className="text-lg font-semibold text-gray-900 whitespace-nowrap ml-2">
            {product.displayPrice}
          </span>
        </div>
        
        {product.germanName && product.germanName !== product.name && (
          <p className="text-sm text-gray-500 italic">{product.germanName}</p>
        )}
        
        <div className="mt-2 mb-4 flex-grow">
          <div 
            ref={descriptionRef}
            className={`text-sm text-gray-600 line-clamp-3 ${isTruncated ? 'cursor-help' : ''}`}
            onMouseEnter={(e) => isTruncated && toggleTooltip(e, true)}
            onMouseLeave={(e) => toggleTooltip(e, false)}
          >
            {product.description}
          </div>
          {showTooltip && isTruncated && (
            <div className="fixed bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 pointer-events-none max-w-xs">
              {product.description}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            {product.displayPrice}
          </span>
          <button
            onClick={handleAddToCart}
            className={`
              bg-gray-900 text-white px-4 py-2 rounded-md
              transition-all duration-200 ease-in-out
              hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
              ${isClicked ? 'scale-95' : 'scale-100 hover:scale-105'}
              flex items-center justify-center gap-2 text-sm font-medium
            `}
          >
            <span>Add to Cart</span>
            {isClicked && (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Products page component that displays a filterable, paginated grid of products
 * organized by category. Handles loading states, error states, and product filtering.
 * @returns {JSX.Element} The rendered products page
 */
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
    console.log('Processing products...');
    
    // Initialize default values
    const defaultReturn = { 
      filteredProducts: [], 
      categories: [], 
      productsByCategory: {}, 
      totalPages: 0, 
      currentItems: [] 
    };
    
    if (!products || !products.length) {
      console.log('No products to process');
      return defaultReturn;
    }
    
    console.log(`Processing ${products.length} products`);
    
    // Helper function to process image URLs to check both locations:
    // 1. Directly in src/assets/
    // 2. In src/assets/Tea Catalogue/[product_id]/
    const processImageUrl = (imagePath, product) => {
      try {
        // If no image path is provided, return null to be filtered out
        if (!imagePath) return null;
        
        // Convert to string and trim
        let imgUrl = String(imagePath).trim();
        if (!imgUrl) return null;
        
        // If it's already a full URL or data URL, return as is
        if (imgUrl.startsWith('http') || imgUrl.startsWith('data:')) {
          return imgUrl;
        }
        
        // Extract just the filename (remove any path components)
        const filename = imgUrl.split(/[\\/]/).pop();
        
        // Get the product ID from the product object
        const productId = product?._id || product?.id || '';
        
        // Try to extract product number from ID (e.g., '21024' from 'tea-bag-mixbox-21024')
        const productNumber = productId.split('-').find(part => /^\d+$/.test(part));
        
        // First, check if the file exists in the Tea Catalogue product directory
        if (productNumber) {
          const teaCataloguePath = `/src/assets/Tea Catalogue/${productNumber}/${filename}`;
          // In a real app, you might want to check if the file exists before returning the path
          return teaCataloguePath;
        }
        
        // If no product number, check if the file exists in the root assets directory
        const rootAssetsPath = `/src/assets/${filename}`;
        // In a real app, you might want to check if the file exists before returning the path
        
        // Return the root assets path if the file exists there, otherwise try Tea Catalogue
        return rootAssetsPath;
      } catch (error) {
        console.error('Error processing image URL:', error, 'Image path:', imagePath);
        console.log('Product ID:', product?._id, 'Product Code:', product?.code);
        return null;
      }
    };
    
    // Process all products
    const allCategories = new Set();
    
    // First, filter out inactive products
    const activeProducts = products.filter(product => product.isActive !== false);
    
    // Then map and process the remaining products
    const processedProducts = activeProducts.map((product) => {
      try {
        const category = getMainCategory(product.category || '');
        allCategories.add(category);
        
        // Get all image fields from the product
        const imageFields = [
          'Loose Leaf Path',
          'Tea Box - Main',
          'Tea Box - German',
          'Tea Box - English',
          'Tea Box - Other Sizes/Views 1',
          'Tea Box - Other Sizes/Views 2',
          'Tea Box - Other Sizes/Views 3',
          'Tea Box - Other Sizes/Views 4',
          'Tea Bag - Individual 1',
          'Tea Bag - Individual 2',
          'Tea Bag - Individual 3',
          'Tea Bag - Individual 4',
          'Tea Bag - With Box 1',
          'Tea Bag - With Box 2',
          'Tea Bags - Pyramid Aesthetic',
          'Tea Bags - Clear Packaging 1',
          'Tea Bags - Clear Packaging 2',
          'Aesthetic/Postcard Image 1',
          'Aesthetic/Postcard Image 2',
          'image_1',
          'image_2',
          'image'
        ];

        // Process all image fields and filter out null/empty values
        const allImages = imageFields
          .map(field => processImageUrl(product[field], product))
          .filter(img => img !== null && img !== '');

        // Ensure we have at least the placeholder image
        const images = allImages.length > 0 
          ? allImages 
          : ['/images/placeholder-product.jpg'];
          
        // Get the English and German names from the product data
        const name = product['English Name'] || product.name || product.product_name || 'Unnamed Product';
        const germanName = product['German Name'] || name;
        
        // Get the price (you may need to adjust this based on your pricing logic)
        const price = parseFloat(product.price) || 0;
        
        return {
          ...product,
          id: product.id || product._id || `product-${Math.random().toString(36).substr(2, 9)}`,
          name,
          germanName,
          price,
          displayPrice: `R${price.toFixed(2)}`,
          images, // Include all processed images
          image: images[0] || '/images/placeholder-product.jpg',
          image_1: images[0] || '/images/placeholder-product.jpg',
          image_2: images[1] || images[0] || '/images/placeholder-product.jpg',
          category: product.category || 'Uncategorized',
          category_name: product.category || 'Uncategorized',
          category_slug: String(product.category || '').toLowerCase().replace(/\s+/g, '-'),
          searchText: `${name} ${germanName} ${product.description || ''} ${product.category || ''}`.toLowerCase()
        };
      } catch (error) {
        console.error('Error processing product:', error, 'Product data:', product);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing
    
    console.log(`Processed ${processedProducts.length} products`);
    
    // Apply filters
    let result = [...processedProducts];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        result = result.filter(product => 
          product.searchText.includes(query)
        );
      }
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    console.log(`After filtering: ${result.length} products`);
    
    // Pagination
    const totalPages = Math.max(1, Math.ceil(result.length / itemsPerPage));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentItems = result.slice(indexOfFirstItem, indexOfLastItem);
    
    // Group by category for display
    const productsByCategory = {};
    currentItems.forEach(product => {
      if (product.category) {
        if (!productsByCategory[product.category]) {
          productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
      }
    });
    
    return {
      filteredProducts: result,
      categories: Array.from(new Set(processedProducts.map(p => p.category).filter(Boolean))).sort(),
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
  
  // Get sorted categories for the filter dropdown
  const sortedCategories = useMemo(() => {
    if (!products || !products.length) return [];
    
    const categories = new Set();
    products.forEach(product => {
      const category = product.category_name || product.category;
      if (category) {
        categories.add(category);
      }
    });
    
    return Array.from(categories).filter(Boolean).sort();
  }, [products]);
  
  /**
   * Ensures that productsByCategory is always an object.
   * If productsByCategory is null or undefined, returns an empty object.
   * @returns {Object} productsByCategory
   */
  const safeProductsByCategory = useMemo(() => {
    return productsByCategory || {};
  }, [productsByCategory]);
  
  /**
   * Renders products grouped by their category with section headers.
   * @returns {JSX.Element[]|null} Array of category sections or null if no categories
   */
  const renderProductsByCategory = () => {
    if (!sortedCategories || !sortedCategories.length) return null;
    
    return sortedCategories.map((category) => {
      const categoryProducts = safeProductsByCategory[category] || [];
      if (categoryProducts.length === 0) return null;
      
      return (
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
            {categoryProducts.map((product) => (
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
      );
    });
  };
  
  /**
   * Loads products from the API with pagination support.
   * Handles loading and error states.
   * @async
   */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading products from API...');
        
        // Fetch all products with pagination
        const { products: productsData } = await productService.getAll({ 
          fetchAll: true, // This will fetch all pages
          limit: 100 // Increase limit to reduce number of API calls
        });
        
        if (!Array.isArray(productsData)) {
          throw new Error('Failed to load products data: Invalid format');
        }
        
        console.log(`Successfully loaded ${productsData.length} products`);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setError(error.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  /**
   * Handles adding a product to the cart and showing a notification.
   * @param {Object} product - The product to add to the cart
   */
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      // Ensure price is a number for the cart
      price: parseFloat(product.price) || 0
    });
    
    setClickedId(product.id);
    setNotification({ show: true, productName: product.name });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
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

      {/* Our Featured Teas Section */}
      <div className="py-16 bg-white">
        <FeaturedProductsCarousel />
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
          
          {filteredProducts.length > 0 ? (
            <>
              {/* Page Numbers */}
              <div className="flex justify-center mt-8 space-x-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  aria-label="Previous page"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

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
            </>
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
          
          {/* Product Grid */}
          <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {currentItems.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                isClicked={clickedId === product._id}
                formatCategoryName={formatCategoryName}
              />
            ))}
          </div>
          
          {/* Pagination Controls - Bottom */}
          {filteredProducts.length > 0 && (
            <div className="flex justify-center mt-12 space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                aria-label="Previous page"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
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
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                aria-label="Next page"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <AddToCartNotification 
            show={notification.show} 
            productName={notification.productName} 
          />
        </div>
      </div>
    </div>
  );
};

// Prop type definitions
ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]).isRequired,
    category: PropTypes.string.isRequired,
    image_1: PropTypes.string,
    image_2: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string
      })
    ])),
    isActive: PropTypes.bool,
    featured: PropTypes.bool,
    stock: PropTypes.number,
    rating: PropTypes.number,
    numReviews: PropTypes.number
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isClicked: PropTypes.bool,
  formatCategoryName: PropTypes.func.isRequired
};

// Products component prop types
Products.propTypes = {
  // Add any props that the Products component might receive
};

export default Products;