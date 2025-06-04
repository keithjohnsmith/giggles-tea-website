import React, { useState } from 'react'
import product2 from '../assets/2.png'
import product3 from '../assets/3.png'
import product4 from '../assets/4.png'
import product5 from '../assets/5.png'
import product6 from '../assets/6.png'
import ProductsCarousel from '../components/Products'
import { useCart } from '../context/CartContext'
import AddToCartNotification from '../components/AddToCartNotification'

const Products = () => {
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

  const products = [
    {
      id: 1,
      name: "Premium Green Tea",
      category: "Green Tea",
      price: "$24.99",
      description: "A delicate and refreshing tea with subtle vegetal notes",
      image: product2
    },
    {
      id: 2,
      name: "Earl Grey Supreme",
      category: "Black Tea",
      price: "$22.99",
      description: "Classic black tea enhanced with oil of bergamot",
      image: product3
    },
    {
      id: 3,
      name: "Jasmine Pearl",
      category: "White Tea",
      price: "$28.99",
      description: "Hand-rolled pearls of white tea scented with jasmine",
      image: product4
    },
    {
      id: 4,
      name: "Oolong Reserve",
      category: "Oolong Tea",
      price: "$26.99",
      description: "Complex and aromatic partially oxidized tea",
      image: product5
    },
    {
      id: 5,
      name: "Chamomile Bloom",
      category: "Herbal Tea",
      price: "$19.99",
      description: "Soothing blend of chamomile flowers and herbs",
      image: product6
    },
    {
      id: 6,
      name: "Masala Chai",
      category: "Spiced Tea",
      price: "$23.99",
      description: "Rich black tea with aromatic Indian spices",
      image: product2
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Featured Products Carousel */}
      <div className="bg-gray-50">
        <ProductsCarousel />
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-4xl font-light text-gray-900 mb-6">Our Collection</h1>
            <p className="text-xl text-gray-600">
              Discover our carefully curated selection of premium teas
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className={`
                      bg-gray-900 text-white px-4 py-2 rounded-md
                      transition-all duration-200 ease-in-out
                      hover:bg-gray-800
                      ${clickedId === product.id ? 'scale-90' : 'scale-100'}
                    `}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <AddToCartNotification 
        show={notification.show} 
        productName={notification.productName} 
      />

      <style jsx>{`
        button {
          transform-origin: center;
        }
        
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default Products; 