import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and fetching order
    const fetchOrder = () => {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder);
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId, getOrderById]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-6">Order Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">We couldn't find an order with that ID.</p>
            <Link
              to="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Return to Home
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
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600">Thank you for your purchase</p>
            <p className="text-gray-500 mt-2">Order #{order.orderNumber}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-6 mb-8">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-gray-900 font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-6">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                We'll send shipping confirmation when your item(s) are on the way!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 text-center transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/orders"
                  className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 text-center transition-colors"
                >
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
