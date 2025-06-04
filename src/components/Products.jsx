import React, { useState } from 'react';
import Slider from 'react-slick';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useCart } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import product2 from '../assets/2.png';
import product3 from '../assets/3.png';
import product4 from '../assets/4.png';
import product5 from '../assets/5.png';
import product6 from '../assets/6.png';

const ProductCard = ({ product, onAddToCart, isClicked }) => {
  const relatedProducts = [
    { id: 1, name: 'Premium Green Tea', category: 'Green Tea', price: '$24.99' },
    { id: 2, name: 'Earl Grey Supreme', category: 'Black Tea', price: '$22.99' },
    { id: 3, name: 'Jasmine Pearl', category: 'White Tea', price: '$28.99' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow mx-2 my-4">
      <div className="aspect-square mb-6 rounded-lg overflow-hidden bg-gray-50">
        <img 
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="text-sm text-gray-500 mb-2">{product.category}</div>
      <h3 className="text-xl font-medium mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900">{product.price}</span>
        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              Related Products
              <ChevronDownIcon className="ml-1 h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-md shadow-lg z-50 py-1">
              {relatedProducts.map((item) => (
                <Menu.Item key={item.id}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } w-full text-left px-4 py-2 text-sm text-gray-700 flex justify-between items-center`}
                    >
                      <div>
                        <span className="block font-medium">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      <span className="text-gray-900">{item.price}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
          <button 
            onClick={() => onAddToCart(product)}
            className={`
              bg-gray-900 text-white px-4 py-2 rounded-md
              transition-all duration-200 ease-in-out
              hover:bg-gray-800
              ${isClicked ? 'scale-90' : 'scale-100'}
            `}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsCarousel = () => {
  const { addToCart } = useCart();
  const [notification, setNotification] = useState({ show: false, productName: '' });
  const [clickedId, setClickedId] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product);
    setClickedId(product.id);
    setNotification({ show: true, productName: product.name });
    
    // Reset button animation
    setTimeout(() => {
      setClickedId(null);
    }, 200);
    
    // Hide notification
    setTimeout(() => {
      setNotification({ show: false, productName: '' });
    }, 2000);
  };

  const sampleProducts = [
    {
      id: 1,
      name: "Premium Green Tea",
      category: "Green Tea",
      description: "A delicate and refreshing tea with subtle vegetal notes",
      price: "$24.99",
      image: product2
    },
    {
      id: 2,
      name: "Earl Grey Supreme",
      category: "Black Tea",
      description: "Classic black tea enhanced with oil of bergamot",
      price: "$22.99",
      image: product3
    },
    {
      id: 3,
      name: "Jasmine Pearl",
      category: "White Tea",
      description: "Hand-rolled pearls of white tea scented with jasmine",
      price: "$28.99",
      image: product4
    },
    {
      id: 4,
      name: "Oolong Reserve",
      category: "Oolong Tea",
      description: "Complex and aromatic partially oxidized tea",
      price: "$26.99",
      image: product5
    },
    {
      id: 5,
      name: "Chamomile Bloom",
      category: "Herbal Tea",
      description: "Soothing blend of chamomile flowers and herbs",
      price: "$19.99",
      image: product6
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    className: "max-w-xl mx-auto"
  };

  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600">Discover our selection of premium teas</p>
        </div>
        
        <Slider {...settings}>
          {sampleProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart}
              isClicked={clickedId === product.id}
            />
          ))}
        </Slider>

        <AddToCartNotification 
          show={notification.show} 
          productName={notification.productName} 
        />
      </div>

      <style jsx>{`
        button {
          transform-origin: center;
        }
        
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </section>
  );
};

export default ProductsCarousel; 