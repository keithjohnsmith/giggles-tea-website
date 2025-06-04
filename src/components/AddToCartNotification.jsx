import React from 'react';

const AddToCartNotification = ({ show, productName }) => {
  if (!show) return null;

  return (
    <div 
      className={`
        fixed bottom-4 right-4 
        bg-gray-900 text-white 
        px-6 py-3 rounded-lg 
        shadow-lg z-50
        transition-all duration-300 ease-in-out
        transform translate-y-0 opacity-100
      `}
      style={{
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div className="flex items-center space-x-2">
        <svg 
          className="w-5 h-5 text-green-400" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7"></path>
        </svg>
        <span className="font-medium">{productName} added to cart!</span>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartNotification; 