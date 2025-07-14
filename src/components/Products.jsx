import React, { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import { useCart } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';
import ProductCard from './ProductCard';
import productService from '../services/productService';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper function to get a random subset of products
const getRandomProducts = (products, count) => {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Process product data to ensure consistent format
  const processProduct = useCallback((product) => {
    // Get all available images for the product
    const images = [];
    for (let i = 1; i <= 5; i++) {
      const imgKey = `image_${i}`;
      if (product[imgKey]) {
        images.push(product[imgKey]);
      }
    }
    
    const processImagePath = (imgPath) => {
      if (!imgPath) return '';
      
      // If it's already a full URL or data URL, use it as is
      if (imgPath.startsWith('http') || imgPath.startsWith('data:')) {
        return imgPath;
      }
      
      // Handle absolute paths (should start with /)
      if (imgPath.startsWith('/')) {
        return imgPath;
      }
      
      // For any other case, assume it's a path relative to public folder
      return `/${imgPath}`;
    };
    
    const imagePath = processImagePath(product.image_1 || product.image);
    
    return {
      ...product,
      id: product.id || product._id,
      name: product.name || product.product_name || 'Unnamed Product',
      price: parseFloat(product.price) || 0,
      displayPrice: `R${parseFloat(product.price || 0).toFixed(2)}`,
      image: imagePath,
      images: images,
      category: product.category_name || product.category || 'Uncategorized',
      category_name: product.category_name || product.category,
      category_slug: product.category_slug || (product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : 'uncategorized'),
      isActive: product.isActive !== false
    };
  }, []);

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Load products and set featured products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading featured products...');
        setLoading(true);
        
        // Fetch all active products with pagination
        const { products: allProducts } = await productService.getAll({ 
          fetchAll: true,
          limit: 50, // Limit to 50 products for the carousel
          filters: { isActive: true } // Only fetch active products
        });
        
        console.log('Products from API:', allProducts);
        
        if (!Array.isArray(allProducts)) {
          throw new Error(`Expected array of products but got: ${typeof allProducts}`);
        }
        
        const processedProducts = allProducts.map(processProduct);
        console.log('Processed products:', processedProducts);
        
        if (processedProducts.length === 0) {
          console.warn('No products were processed. Check if the API returned any data.');
        }
        
        // Set all products for related products functionality
        setProducts(processedProducts);
        
        // Select random 5 products for the featured carousel
        const randomFeatured = getRandomProducts(processedProducts, 5);
        setFeaturedProducts(randomFeatured);
        
      } catch (err) {
        console.error('Error loading products:', {
          error: err,
          message: err.message,
          stack: err.stack
        });
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [processProduct]);

  // Get related products for a given product (same category, excluding the product itself)
  const getRelatedProducts = useCallback((product, allProducts) => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(p => 
        p.id !== product.id && 
        p.category_name === product.category_name && 
        p.isActive !== false
      )
      .slice(0, 3) // Limit to 3 related products
      .map(p => ({
        ...p,
        price: p.displayPrice || `R${parseFloat(p.price || 0).toFixed(2)}`,
        category: p.category_name || p.category
      }));
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setClickedId(product.id);
    setNotification({ 
      show: true, 
      productName: product.name 
    });
    
    // Reset button animation
    setTimeout(() => {
      setClickedId(null);
    }, 200);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Handle related product click
  const handleRelatedProductClick = (relatedProduct) => {
    // Find the index of the related product in the featured products
    const relatedIndex = featuredProducts.findIndex(p => 
      p.id === relatedProduct.id
    );
    
    if (relatedIndex !== -1 && sliderRef.current) {
      // If the related product is in the featured products, navigate to that slide
      sliderRef.current.slickGoTo(relatedIndex);
      setCurrentSlide(relatedIndex);
    }
  };

  // Use carouselSettings defined above

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
            {...carouselSettings}
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