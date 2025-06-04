import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'paynow',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This will be replaced with actual payment processing
    alert('Order placed successfully! Payment integration coming soon.');
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors mt-6"
            >
              Continue to Shipping
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">Shipping Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">Payment Method</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paynow"
                    checked={formData.paymentMethod === 'paynow'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-gray-900">Paynow (Coming Soon)</span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-gray-900">Cash on Delivery</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-6">Checkout</h1>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-12 text-center">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-center items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 1 ? 'border-gray-900' : 'border-gray-300'}`}>1</span>
                <span>Contact</span>
              </div>
              <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 2 ? 'border-gray-900' : 'border-gray-300'}`}>2</span>
                <span>Shipping</span>
              </div>
              <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-gray-900' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 3 ? 'border-gray-900' : 'border-gray-300'}`}>3</span>
                <span>Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <form className="bg-white rounded-lg shadow-sm p-6">
                {renderStep()}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-2xl font-light text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>${getCartTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 