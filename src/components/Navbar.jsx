import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo_giggles-tea_centre.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "text-gray-900" : "text-gray-700";
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 md:h-28">
          {/* Navigation Links - Left Side */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActive('/')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}>
              Home
            </Link>
            <Link to="/products" className={`${isActive('/products')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}>
              Products
            </Link>
            <Link to="/about" className={`${isActive('/about')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}>
              About
            </Link>
            <Link to="/contact" className={`${isActive('/contact')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}>
              Contact
            </Link>
            <Link to="/cart" className={`${isActive('/cart')} hover:text-gray-900 px-3 py-2 text-sm font-medium relative`}>
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </span>
            </Link>
          </div>

          {/* Logo - Right Side */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-20 w-auto md:h-24"
                src={logo}
                alt="Giggles Tea Logo"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close Icon */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')} hover:text-gray-900 hover:bg-gray-50`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/products')} hover:text-gray-900 hover:bg-gray-50`}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about')} hover:text-gray-900 hover:bg-gray-50`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/contact')} hover:text-gray-900 hover:bg-gray-50`}
            >
              Contact
            </Link>
            <Link
              to="/cart"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/cart')} hover:text-gray-900 hover:bg-gray-50`}
            >
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart {getCartCount() > 0 && `(${getCartCount()})`}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 