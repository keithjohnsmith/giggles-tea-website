import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Normalize the product ID to handle both id and _id
      const productId = product.id || product._id;
      if (!productId) {
        console.error('Product is missing an ID:', product);
        return prevItems;
      }
      
      const existingItem = prevItems.find(item => (item.id === productId) || (item._id === productId));
      
      // Process image URL to ensure it's a valid URL
      const processImageUrl = (img) => {
        if (!img) return '/images/placeholder-product.jpg';
        
        // If it's already a full URL or data URL, use it as is
        if (img.startsWith('http') || img.startsWith('data:')) {
          return img;
        }
        
        // Clean up the path by removing './' and normalizing
        let cleanPath = img.replace(/^\.\//, ''); // Remove leading ./ if present
        
        // For development, we need to handle Vite's asset handling
        if (import.meta.env.DEV) {
          // In development, try to import the asset directly
          try {
            // This will be handled by Vite's import.meta.glob
            const modules = import.meta.glob('/src/assets/**/*', { eager: true });
            const assetPath = Object.keys(modules).find(path => path.endsWith(cleanPath));
            if (assetPath) {
              return modules[assetPath].default;
            }
          } catch (e) {
            console.warn('Error loading asset:', e);
          }
        }
        
        // For production or if dynamic import fails, use the public path
        if (cleanPath.startsWith('/')) {
          // If it's already a full path, return as is
          if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/images/') || cleanPath.startsWith('/assets/')) {
            return cleanPath;
          }
          // Otherwise, assume it's in the assets folder
          return `/assets${cleanPath}`;
        }
        
        // If it's a relative path without a leading slash, assume it's in the assets folder
        return `/assets/${cleanPath}`;
      };

      // Process the image URL for the product
      const originalImage = product.image_1 || product.image;
      const imageUrl = processImageUrl(originalImage);
      
      // Log detailed information about the image path resolution
      console.log('Adding to cart - Image URL:', { 
        productName: product.name || product.product_name,
        originalImage,
        processedImage: imageUrl,
        fullUrl: window.location.origin + imageUrl,
        isRelative: !originalImage.startsWith('/') && !originalImage.startsWith('http') && !originalImage.startsWith('data:')
      });
      
      // Check if the image exists
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        const img = new Image();
        img.onload = () => console.log(`Image loaded successfully: ${imageUrl}`);
        img.onerror = () => console.error(`Failed to load image: ${imageUrl}`);
        img.src = imageUrl;
      }
      
      if (existingItem) {
        return prevItems.map(item =>
          (item.id === productId) || (item._id === productId)
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                // Ensure we have both id and _id for consistency
                id: productId,
                _id: productId,
                // Ensure we have a valid image URL
                image: imageUrl || item.image
              }
            : item
        );
      }
      
      // Ensure the product has a consistent ID structure and image URL when added to cart
      return [...prevItems, { 
        ...product,
        quantity: 1,
        id: productId,
        _id: productId,
        // Ensure we have a valid image URL
        image: imageUrl || '/images/placeholder-product.jpg',
        // Include other product details that might be needed
        name: product.name || product.product_name,
        price: product.price,
        category: product.category
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 