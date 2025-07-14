import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const OrderContext = createContext();

// Custom hook to use the order context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

// Order provider component
export const OrderProvider = ({ children }) => {
  // Initialize state with orders from localStorage or empty array
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
      console.error('Failed to parse orders from localStorage', error);
      return [];
    }
  });

  // Save orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save orders to localStorage', error);
    }
  }, [orders]);

  // Create a new order
  const createOrder = (orderData) => {
    try {
      const newOrder = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'pending',
        ...orderData
      };
      
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return newOrder;
    } catch (error) {
      console.error('Failed to create order', error);
      throw error;
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Update order status
  const updateOrderStatus = (orderId, status) => {
    try {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status', error);
      throw error;
    }
  };

  // Context value
  const value = React.useMemo(() => ({
    orders,
    createOrder,
    getOrderById,
    updateOrderStatus
  }), [orders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
