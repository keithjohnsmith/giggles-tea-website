import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const navigate = useNavigate();

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsCreatingOrder(true);
    
    try {
      // Create order data
      const orderData = {
        items: [...cartItems],
        total: getCartTotal(),
        status: 'pending',
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // Create the order
      const newOrder = createOrder(orderData);
      
      // Clear the cart
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order-confirmation/${newOrder.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-6">Your Cart</h1>
            <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-12 text-center">Your Cart</h1>
          
          <div className="bg-white rounded-lg shadow-sm">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="ml-6 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span className="text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-6 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center text-lg font-medium text-gray-900 mb-6">
              <p>Total</p>
              <p>${getCartTotal().toFixed(2)}</p>
            </div>
            
            <button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder || cartItems.length === 0}
              className={`w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center mb-4 ${(isCreatingOrder || cartItems.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCreatingOrder ? 'Creating Order...' : 'Proceed to Checkout'}
            </button>
            
            <Link
              to="/products"
              className="block text-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 