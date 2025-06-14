import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useCart } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';
import { productService } from '../services/api';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper function to get a random subset of products
const getRandomProducts = (products, count) => {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const ProductCard = ({ product, onAddToCart, isClicked, relatedProducts = [], onRelatedProductClick }) => {
  const [currentImage, setCurrentImage] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const descriptionRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const imageRef = useRef(null);

  // Process image paths to use direct imports from src/assets
  const processImageUrl = (imageName) => {
    if (!imageName) return '';
    try {
      // If it's already a URL, return as is
      if (imageName.startsWith('http') || imageName.startsWith('data:')) {
        return imageName;
      }
      // Remove any leading slashes or paths, just get the filename
      const cleanName = imageName.split('/').pop().split('\\').pop();
      // Try to dynamically import the image from assets
      const imageUrl = new URL(`/src/assets/${cleanName}`, import.meta.url).href;
      return imageUrl;
    } catch (e) {
      console.warn(`Could not resolve image path: ${imageName}`, e);
      return '';
    }
  };

  // Set initial image
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = (imagePath, type = 'primary') => {
      if (!imagePath) {
        console.log(`[${product.id}] No ${type} image path provided`);
        return Promise.resolve('');
      }
      
      // If it's already a full URL or data URL, use it directly
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        console.log(`[${product.id}] Using direct URL for ${type} image:`, imagePath);
        return Promise.resolve(imagePath);
      }
      
      // For local paths, try to construct the correct URL
      try {
        // Get just the filename
        const cleanName = imagePath.split('/').pop().split('\\').pop();
        
        // First try to import directly (for Vite/Webpack)
        try {
          const imageModule = import.meta.glob('/src/assets/*', { eager: true });
          const imagePath = Object.keys(imageModule).find(path => 
            path.endsWith(cleanName)
          );
          if (imagePath) {
            return Promise.resolve(imageModule[imagePath].default);
          }
        } catch (e) {
          console.warn(`[${product.id}] Could not import image module:`, e);
        }
        
        // Fallback to URL resolution - try both /assets/ and /src/assets/
        const basePaths = ['/assets/', '/src/assets/'];
        
        for (const basePath of basePaths) {
          try {
            const imageUrl = new URL(basePath + cleanName, window.location.origin).href;
            console.log(`[${product.id}] Resolved ${type} image URL:`, imageUrl);
            return Promise.resolve(imageUrl);
          } catch (e) {
            console.warn(`[${product.id}] Could not resolve ${type} image URL (${basePath}):`, e);
          }
        }
        
        // If all else fails, try to construct a relative path
        const relativePath = imagePath.startsWith('./') ? imagePath : `./${imagePath}`;
        console.log(`[${product.id}] Trying relative path:`, relativePath);
        return Promise.resolve(relativePath);
        
      } catch (e) {
        console.error(`[${product.id}] Error processing ${type} image path '${imagePath}':`, e);
        return Promise.resolve('');
      }
    };

    const setImage = async () => {
      console.log(`[${product.id}] Setting up image for product:`, {
        name: product.name || product.product_name,
        image: product.image,
        image_1: product.image_1,
        image_2: product.image_2
      });

      if (!product.image && !product.image_1) {
        console.log(`[${product.id}] No primary image paths available`);
        if (isMounted) setIsImageLoaded(true);
        return;
      }
      
      try {
        // Try primary image first (image_1 or image)
        const primaryImagePath = product.image_1 || product.image;
        if (primaryImagePath) {
          console.log(`[${product.id}] Attempting to load primary image:`, primaryImagePath);
          const primaryImage = await loadImage(primaryImagePath, 'primary');
          if (primaryImage && isMounted) {
            console.log(`[${product.id}] Successfully loaded primary image`);
            setCurrentImage(primaryImage);
            setIsImageLoaded(true);
            return;
          }
          console.log(`[${product.id}] Failed to load primary image`);
        }
        
        // If primary fails, try fallback (image_2)
        if (product.image_2) {
          console.log(`[${product.id}] Attempting to load fallback image:`, product.image_2);
          const fallbackImage = await loadImage(product.image_2, 'fallback');
          if (fallbackImage && isMounted) {
            console.log(`[${product.id}] Successfully loaded fallback image`);
            setCurrentImage(fallbackImage);
            setIsImageLoaded(true);
            return;
          }
          console.log(`[${product.id}] Failed to load fallback image`);
        }
        
        // If we get here, no image loaded successfully
        console.warn(`[${product.id}] No valid images could be loaded`);
        if (isMounted) setIsImageLoaded(true);
      } catch (e) {
        console.error(`[${product.id}] Error in setImage:`, e);
        if (isMounted) setIsImageLoaded(true);
      }
    };
    
    setImage();
    
    return () => {
      isMounted = false;
    };
  }, [product.id, product.image, product.image_1, product.image_2, product.name, product.product_name]);

  // Check if text is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextTruncated = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight || 
                             descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth;
      setIsTruncated(isTextTruncated);
    }
  }, [product.description]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mx-2 my-4">
      <div className="aspect-square mb-6 rounded-lg overflow-hidden">
        {!isImageLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <img 
            ref={imageRef}
            src={currentImage}
            alt={product.name || 'Product image'}
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
      <div className="text-sm text-gray-500 mb-2">{product.category}</div>
      <h3 className="text-xl font-medium mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900">
          {product.displayPrice || `$${(product.price || 0).toFixed(2)}`}
        </span>
        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              Related Products
              <ChevronDownIcon className="ml-1 h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-md shadow-lg z-50 py-1">
              {relatedProducts.map((item) => (
                <Menu.Item key={item.id}>
                  {({ active }) => (
                    <button
                      onClick={() => onRelatedProductClick(item)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2 text-sm text-gray-700 flex justify-between items-center hover:bg-gray-50 transition-colors`}
                    >
                      <div>
                        <span className="block font-medium">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      <span className="text-gray-900">{item.price}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
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

const ProductsCarousel = () => {
  const { addToCart } = useCart();
  const [notification, setNotification] = useState({ show: false, productName: '' });
  const [clickedId, setClickedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getAll();
        if (productsData && Array.isArray(productsData)) {
          // Filter active products and process them
          const activeProducts = productsData
            .filter(product => product.isActive !== false)
            .map(product => {
              // Process the image path to ensure it works in both dev and prod
              const processImagePath = (imgPath) => {
                if (!imgPath) return '';
                // If it's already a full URL or data URL, use it as is
                if (imgPath.startsWith('http') || imgPath.startsWith('data:')) {
                  return imgPath;
                }
                // If it's a relative path, make it root-relative
                return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
              };
              
              const imagePath = processImagePath(product.image_1 || product.image);
              
              return {
                ...product,
                name: product.name || product.product_name,
                // Store price as a number for calculations
                price: parseFloat(product.price) || 0,
                // Store formatted price for display
                displayPrice: `$${parseFloat(product.price || 0).toFixed(2)}`,
                image: imagePath,
                // Store the original image path for reference
                originalImage: product.image_1 || product.image,
                category: product.category || 'Uncategorized'
              };
            });
          setProducts(activeProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get random products for the carousel
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Initialize featured products on component mount
  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(getRandomProducts(products, 5));
    }
  }, [products]);

  // Get related products for a given product (same category, excluding the product itself)
  const getRelatedProducts = (product, allProducts) => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(p => 
        p.id !== product.id && 
        p.category === product.category && 
        p.isActive !== false
      )
      .slice(0, 3); // Limit to 3 related products
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setClickedId(product.id || product._id);
    setNotification({ show: true, productName: product.name || product.product_name });
    
    // Reset button animation
    setTimeout(() => {
      setClickedId(null);
    }, 200);
    
    // Hide notification
    setTimeout(() => {
      setNotification({ show: false, productName: '' });
    }, 2000);
  };
  
  // Handle related product click
  const handleRelatedProductClick = (relatedProduct) => {
    // Find the index of the related product in the featured products
    const relatedIndex = featuredProducts.findIndex(p => 
      (p.id || p._id) === (relatedProduct.id || relatedProduct._id)
    );
    
    if (relatedIndex !== -1 && sliderRef.current) {
      // If the related product is in the featured products, navigate to that slide
      sliderRef.current.slickGoTo(relatedIndex);
      setCurrentSlide(relatedIndex);
    } else if (sliderRef.current) {
      // If not in featured products, replace the current slide with the related product
      const newFeaturedProducts = [...featuredProducts];
      newFeaturedProducts[currentSlide] = relatedProduct;
      setFeaturedProducts(newFeaturedProducts);
      
      // Force a re-render and then go to the slide
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(currentSlide);
        }
      }, 0);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    className: "max-w-xl mx-auto"
  };

  if (loading) {
    return (
      <section className="w-full py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
            <div className="h-96 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600">Discover our selection of premium teas</p>
        </div>
        
        {featuredProducts.length > 0 ? (
          <Slider 
            ref={sliderRef}
            {...settings}
            beforeChange={(current, next) => setCurrentSlide(next)}
          >
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id || product._id} 
                product={product} 
                onAddToCart={handleAddToCart}
                isClicked={clickedId === (product.id || product._id)}
                relatedProducts={getRelatedProducts(product, products)}
                onRelatedProductClick={handleRelatedProductClick}
              />
            ))}
          </Slider>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured products available at the moment.</p>
          </div>
        )}

        <AddToCartNotification 
          show={notification.show} 
          productName={notification.productName} 
        />
      </div>

      <style>
        {`
          .product-button {
            transform-origin: center;
          }
          
          .product-button:active {
            transform: scale(0.95);
          }
        `}
      </style>
    </section>
  );
};

export default ProductsCarousel; 