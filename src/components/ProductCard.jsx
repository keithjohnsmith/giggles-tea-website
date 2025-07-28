import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrow components for the carousel
const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !right-1`}
      style={{ ...style, display: 'block', zIndex: 1 }}
      onClick={onClick}
      aria-label="Next image"
    />
  );
};

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !left-1`}
      style={{ ...style, display: 'block', zIndex: 1 }}
      onClick={onClick}
      aria-label="Previous image"
    />
  );
};

// Default box of tea image path - using the existing placeholder image
const DEFAULT_TEA_BOX_IMAGE = '/images/placeholder-product.jpg';

// Import the getImageUrl function from config
import { getImageUrl } from '../config.js';

// Process image paths to handle different sources
const processImageUrl = (imagePath) => {
  try {
    // If no image path is provided, return the default tea box image
    if (!imagePath) return DEFAULT_TEA_BOX_IMAGE;
    
    // If it's already a placeholder or asset path, return as is
    if (imagePath === DEFAULT_TEA_BOX_IMAGE || imagePath.startsWith('/images/') || imagePath.startsWith('/assets/')) {
      return imagePath;
    }
    
    // Use the centralized getImageUrl function for all other cases
    const processedUrl = getImageUrl(imagePath);
    
    // If getImageUrl returns a placeholder, use our default instead
    if (processedUrl === '/images/placeholder-product.jpg') {
      return DEFAULT_TEA_BOX_IMAGE;
    }
    
    return processedUrl;
    
  } catch (e) {
    console.warn(`Error processing image path: ${imagePath}`, e);
    return DEFAULT_TEA_BOX_IMAGE;
  }
};

const ProductCard = ({ product, onAddToCart, isClicked, relatedProducts = [], onRelatedProductClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const descriptionRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const sliderRef = useRef(null);
  
  // Get all available images for the product
  const productImages = React.useMemo(() => {
    const images = [];
    
    // First, check if we have images array in the product
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(imgPath => {
        if (imgPath) {
          const processedPath = processImageUrl(imgPath);
          images.push({
            original: processedPath,
            thumbnail: processedPath
          });
        }
      });
    }
    
    // If no images were found in the images array, check for individual image properties
    if (images.length === 0) {
      for (let i = 1; i <= 5; i++) {
        const imgKey = `image_${i}`;
        if (product[imgKey]) {
          const processedPath = processImageUrl(product[imgKey]);
          images.push({
            original: processedPath,
            thumbnail: processedPath,
          });
        }
      }
    }
    
    // If still no valid images, use the default image
    if (images.length === 0) {
      images.push({
        original: DEFAULT_TEA_BOX_IMAGE,
        thumbnail: DEFAULT_TEA_BOX_IMAGE
      });
    }
    
    return images;
  }, [product]);

  // Handle image loading for carousel with error handling
  useEffect(() => {
    // Create a new array to avoid mutating the prop directly
    const updatedProductImages = [...productImages];
    let isMounted = true;
    
    const checkAndLoadImages = async () => {
      if (updatedProductImages.length === 0) {
        if (isMounted) {
          setIsImageLoaded(true);
        }
        return;
      }

      // Preload images and check if they load successfully
      const loadImage = (src) => {
        return new Promise((resolve) => {
          // Skip data URLs as they should always load
          if (src.startsWith('data:')) return resolve(true);
          
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            resolve(false);
          };
          img.src = src;
        });
      };

      try {
        // Check if any of the product images load successfully
        const imageChecks = await Promise.all(
          updatedProductImages.map(img => loadImage(img.original))
        );
        
        if (!isMounted) return;
        
        // If no images loaded successfully, use the default image
        if (!imageChecks.some(success => success) && updatedProductImages.length > 0) {
          updatedProductImages.length = 0; // Clear any invalid images
          updatedProductImages.push({
            original: DEFAULT_TEA_BOX_IMAGE,
            thumbnail: DEFAULT_TEA_BOX_IMAGE
          });
        }
        
        setIsImageLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setIsImageLoaded(true);
        }
      }
    };

    checkAndLoadImages();
    
    return () => {
      isMounted = false;
    };
  }, [productImages]);

  // Check if text is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextTruncated = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight || 
                             descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth;
      setIsTruncated(isTextTruncated);
    }
  }, [product.description]);

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: productImages.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    beforeChange: (current, next) => setCurrentSlide(next),
    customPaging: (i) => (
      <div key={i} className="w-2 h-2 mx-1">
        <button
          className={`w-full h-full rounded-full focus:outline-none ${currentSlide === i ? 'bg-gray-700' : 'bg-gray-300'}`}
          aria-label={`Go to slide ${i + 1}`}
        />
      </div>
    ),
    dotsClass: 'slick-dots !bottom-0',
    appendDots: dots => (
      <div className="slick-dots-container">
        <ul className="slick-dots" style={{ margin: 0, padding: 0 }}>
          {dots}
        </ul>
      </div>
    )
  };

  // Placeholder for when no images are available
  const placeholderImage = (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 p-12">
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mx-2 my-4">
      <div className="aspect-square mb-6 rounded-lg overflow-hidden relative">
        {!isImageLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        ) : productImages.length > 0 ? (
          <Slider {...carouselSettings} ref={sliderRef}>
            {productImages.map((img, index) => (
              <div key={index} className="w-full h-full">
                <img
                  src={img.original}
                  alt={`${product.name || 'Product image'} ${index + 1}`}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDFkMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAxM0g2YTUgNSAwIDAgMC03IDlIMjBhNSA1IDAgMCAwLTUtNXoiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                    e.target.className = 'w-full h-full bg-gray-100 p-12';
                  }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          placeholderImage
        )}
        
        {/* Image counter for multiple images */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {`${currentSlide + 1} / ${productImages.length}`}
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 mb-2">{product.category_name || 'Uncategorized'}</div>
      <h3 className="text-xl font-medium mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900">
          {product.displayPrice || `R${(product.price || 0).toFixed(2)}`}
        </span>
        <div className="flex items-center gap-2">
          {relatedProducts.length > 0 && (
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
          )}
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

export default ProductCard;
