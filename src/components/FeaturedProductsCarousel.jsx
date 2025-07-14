import React, { useState, useEffect, useCallback } from 'react';
import Slider from 'react-slick';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import EnhancedProductCard from './EnhancedProductCard';
import productService from '../services/productService';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrow components
const SampleNextArrow = ({ className, style, onClick }) => (
  <button
    className={`${className} !right-[-40px] z-10`}
    style={{ ...style, display: 'flex' }}
    onClick={onClick}
    aria-label="Next product"
  >
    <ChevronRightIcon className="h-8 w-8 text-gray-700 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-colors" />
  </button>
);

const SamplePrevArrow = ({ className, style, onClick }) => (
  <button
    className={`${className} !left-[-40px] z-10`}
    style={{ ...style, display: 'flex' }}
    onClick={onClick}
    aria-label="Previous product"
  >
    <ChevronLeftIcon className="h-8 w-8 text-gray-700 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-colors" />
  </button>
);

const FeaturedProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load and process products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all active products with pagination
      const { products: allProducts } = await productService.getAll({ 
        fetchAll: true,
        limit: 50, // Fetch up to 50 products for the carousel
        filters: { isActive: true } // Only fetch active products
      });
      
      if (!Array.isArray(allProducts)) {
        throw new Error('Invalid response format from API');
      }
      
      // If we have products, select 7 random ones for the carousel
      let selectedProducts = [];
      if (allProducts.length > 0) {
        // Create a shuffled copy of the products array
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        // Select up to 7 products
        selectedProducts = shuffled.slice(0, 7);
      }
      
      console.log(`Loaded ${selectedProducts.length} featured products`);
      setProducts(selectedProducts);
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError('Failed to load featured products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    centerMode: true,
    centerPadding: '0',
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: products.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    beforeChange: (current, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '20px'
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '60px',
          dots: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '30px',
          dots: false
        }
      }
    ]
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Our Featured Teas</h2>
            <div className="w-20 h-1 bg-gray-300 mx-auto"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse w-full max-w-4xl">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-500">{error || 'No featured products available'}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">Our Featured Teas</h2>
          <div className="w-20 h-1 bg-gray-300 mx-auto"></div>
        </div>

        <div className="relative">
          <Slider {...settings}>
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className={`px-2 transition-transform duration-300 ${
                  Math.abs(currentSlide - index) === 1 ? 'scale-90' : 
                  currentSlide === index ? 'scale-100' : 'scale-90'
                }`}
              >
                <div className="px-2">
                  <EnhancedProductCard 
                    product={product}
                    isInCart={false}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Custom styles for the carousel */
          .featured-carousel .slick-slide {
            transition: all 300ms ease;
            padding: 0 15px;
            box-sizing: border-box;
            opacity: 1;
            transform: scale(1);
          }
          
          .featured-carousel .slick-center {
            transform: scale(1);
            opacity: 1;
            z-index: 1;
          }
          
          .featured-carousel .slick-list {
            padding: 40px 0 !important;
            margin: 0 -15px;
          }
          
          /* Ensure cards don't overlap */
          .featured-carousel .slick-slide > div {
            margin: 0 5px;
          }
          
          /* Hide arrows on mobile */
          @media (max-width: 768px) {
            .featured-carousel .slick-arrow {
              display: none !important;
            }
          }
        `
      }} />
    </section>
  );
};

export default FeaturedProductsCarousel;
