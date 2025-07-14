import React, { useState, useRef, useEffect } from 'react';
import Slider from 'react-slick';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrow components for the carousel
const SampleNextArrow = ({ className, style, onClick }) => (
  <button
    className={`${className} !right-2 z-10`}
    style={{ ...style, display: 'flex' }}
    onClick={onClick}
    aria-label="Next image"
  >
    <ChevronRightIcon className="h-6 w-6 text-gray-700 bg-white/80 rounded-full p-0.5" />
  </button>
);

const SamplePrevArrow = ({ className, style, onClick }) => (
  <button
    className={`${className} !left-2 z-10`}
    style={{ ...style, display: 'flex' }}
    onClick={onClick}
    aria-label="Previous image"
  >
    <ChevronLeftIcon className="h-6 w-6 text-gray-700 bg-white/80 rounded-full p-0.5" />
  </button>
);

const EnhancedProductCard = ({ product, onAddToCart, isInCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [validImages, setValidImages] = useState(product.images || []);
  const [hasValidHoverImage, setHasValidHoverImage] = useState(!!product.hoverImage);
  const descriptionRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const sliderRef = useRef(null);
  const imageContainerRef = useRef(null);
  const { addToCart } = useCart();
  
  // Handle image loading errors
  const handleImageError = (e) => {
    const failedSrc = e.target.src;
    console.warn(`Failed to load image: ${failedSrc}`);
    
    // Try to fix the path and reload once
    const tryFixPath = (path) => {
      // If the path is already a full URL, try to fix it by checking different variations
      if (path.startsWith('http')) {
        const url = new URL(path);
        const pathname = url.pathname;
        
        // Extract the filename from the path
        const filename = pathname.split('/').pop();
        
        // Try different variations of the path
        const variations = [
          // Original path
          path,
          // Try with the backend server URL
          `http://localhost:8000${pathname}`,
          // Try with the Tea Catalogue path
          `http://localhost:8000/server/Tea%20Catalogue/${product.id}/${filename}`,
          // Try with different encodings
          `http://localhost:8000/server/Tea Catalogue/${product.id}/${filename}`,
          // Try with just the filename
          `http://localhost:8000/server/Tea%20Catalogue/${filename}`,
          `http://localhost:8000/server/Tea Catalogue/${filename}`
        ];
        
        // Add variations with different encodings and formats
        variations.push(
          ...variations.map(v => v.replace(/%20/g, ' ')),
          ...variations.map(v => v.replace(/ /g, '%20')),
          // Try with different file extensions
          ...variations.map(v => v.replace(/\.jpg$/, '.jpeg')),
          ...variations.map(v => v.replace(/\.jpeg$/, '.jpg')),
          ...variations.map(v => v.replace(/\.png$/, '.jpg')),
          ...variations.map(v => v.replace(/\.jpg$/, '.png'))
        );
        
        // Make sure we have unique variations
        const uniqueVariations = [...new Set(variations)];
        
        for (const variant of uniqueVariations) {
          if (variant !== path) {
            const img = new Image();
            img.onload = () => {
              // If this variant works, update the source
              e.target.src = variant;
              e.target.onerror = null; // Remove error handler to prevent loops
              console.log(`Successfully loaded image variant: ${variant}`);
              
              // Also update the valid images array with the working URL
              setValidImages(prev => {
                const newImages = [...prev];
                const index = newImages.findIndex(img => img === path);
                if (index !== -1) {
                  newImages[index] = variant;
                }
                return newImages;
              });
            };
            img.onerror = () => console.log(`Failed to load variant: ${variant}`);
            img.src = variant;
          }
        }
      }
    };
    
    // Remove the failed image from the valid images array
    setValidImages(prev => {
      const newImages = prev.filter(img => {
        // Compare paths after removing any query parameters and normalizing
        const cleanImg = img.split('?')[0];
        const cleanFailed = failedSrc.split('?')[0];
        return cleanImg !== cleanFailed;
      });
      
      if (newImages.length === 0) {
        // If no images left, add a simple SVG placeholder
        const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E`;
        return [placeholderSvg];
      }
      
      // Try to fix the path for the remaining images
      setTimeout(() => {
        tryFixPath(failedSrc);
      }, 100);
      
      return newImages;
    });
    
    // Also update the hover image state if this was the hover image
    if (product.hoverImage && failedSrc.includes(product.hoverImage.split('/').pop())) {
      setHasValidHoverImage(false);
    }
  };
  
  // Handle hover image error
  const handleHoverImageError = (e) => {
    console.warn('Failed to load hover image');
    setHasValidHoverImage(false);
  };
  
  // Update isImageLoaded when validImages changes
  useEffect(() => {
    setIsImageLoaded(validImages.length > 0);
  }, [validImages]);
  
  // Handle hover state changes
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, // Disable auto-play as per user request
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
  };

  // Check if text is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const isTextTruncated = 
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight || 
        descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth;
      setIsTruncated(isTextTruncated);
    }
  }, [product.description]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: product.code, // Use product code as ID
      name: product.name,
      price: product.price || 0, // Default to 0 if price not set
      image: product.images[0] || '',
      quantity: 1
    });
    if (onAddToCart) onAddToCart();
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
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div 
        className="aspect-[3/4] mb-4 rounded-lg overflow-hidden relative flex-shrink-0 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={imageContainerRef}
      >
        {/* Loading spinner */}
        {!isImageLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Main image carousel */}
        {validImages.length > 0 ? (
          <div className={`relative w-full h-full transition-opacity duration-300 ${isHovered && hasValidHoverImage ? 'opacity-0' : 'opacity-100'}`}>
            <Slider {...carouselSettings} ref={sliderRef} className="h-full">
              {validImages.map((img, index) => (
                <div key={index} className="w-full h-full">
                  <img
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-contain p-4"
                    onLoad={() => {
                      setIsImageLoaded(true);
                      // Force a re-render to ensure the image is displayed
                      setValidImages(current => [...current]);
                    }}
                    onError={(e) => {
                      // Add a small delay to prevent rapid state updates
                      setTimeout(() => handleImageError(e), 100);
                    }}
                    loading="lazy"
                    key={`${img}-${index}`} // Add key to force re-render on error
                  />
                </div>
              ))}
            </Slider>
            
            {/* Image counter for multiple images */}
            {validImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {`${currentSlide + 1} / ${validImages.length}`}
              </div>
            )}
          </div>
        ) : null}
        
        {/* Hover image (loose leaf) */}
        {hasValidHoverImage && (
          <div 
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <img
              src={product.hoverImage}
              alt={`${product.name} - Loose Leaf`}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                console.warn('Failed to load hover image:', product.hoverImage);
                setHasValidHoverImage(false);
              }}
              loading="lazy"
              key={`hover-${product.hoverImage}`}
            />
          </div>
        )}
        
        {/* Show empty state if no images are available */}
        {validImages.length === 0 && !hasValidHoverImage && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 p-12">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E" 
              alt="No image available"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col">
        <div className="text-sm text-gray-500 mb-1">
          {product.category} {product.category_de && `| ${product.category_de}`}
        </div>
        <h3 className="text-xl font-medium mb-1 line-clamp-2 h-14">
          {product.name}
          {product.germanName && (
            <div className="text-sm text-gray-600 mt-1">{product.germanName}</div>
          )}
        </h3>
        <div className="text-sm text-gray-500 mb-2">
          Code: {product.code}
        </div>
        
        <div 
          ref={descriptionRef}
          className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow"
        >
          {product.description || 'No description available.'}
          {isTruncated && (
            <button 
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-indigo-600 text-xs ml-1 hover:underline focus:outline-none"
            >
              {showTooltip ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        
        {showTooltip && (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 mb-4 z-20">
            <p className="text-sm text-gray-700">{product.description}</p>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              {product.displayPrice || `$${(product.price || 0).toFixed(2)}`}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200
                ${isInCart 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow-md transform hover:-translate-y-0.5'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              `}
            >
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
