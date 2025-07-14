import React from 'react';
import teaShop from '../assets/paul-vincent-roll-c61jL_NpAn8-unsplash.webp';
import about1 from '../assets/about1.jpg';
import about2 from '../assets/1707_1711_1705 (2).jpg';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${teaShop})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4">Our Story</h1>
          <p className="text-xl text-gray-200">Bringing the world's finest teas to Zimbabwe since 2025</p>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-light mb-6">The Birth of Giggles Tea</h2>
              <p className="text-gray-600 mb-6">
                In 2025, a passionate husband and wife team embarked on a journey to bring the finest teas to Zimbabwe. 
                What began as a shared love for authentic tea experiences blossomed into Giggles Tea, a premier 
                destination for tea enthusiasts across the nation.
              </p>
              <p className="text-gray-600">
                Our name reflects the joy and warmth that a perfect cup of tea brings. We believe that every sip 
                should be an experience that brings a smile to your face - a little "giggle" in every cup.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={about1} 
                alt="Giggles Tea Founders" 
                className="rounded-lg shadow-xl w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Tea Journey */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={about2} 
                alt="Tea Tasting Experience" 
                className="rounded-lg shadow-xl w-full h-auto max-h-[500px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-light mb-6">German Excellence, Zimbabwean Heart</h2>
              <p className="text-gray-600 mb-6">
                We take pride in our exclusive partnership with Germany's finest tea importers, bringing 
                you premium teas sourced from the most renowned tea gardens across the globe. Our German 
                connection ensures the highest quality standards and sustainable sourcing practices.
              </p>
              <p className="text-gray-600">
                While our teas travel thousands of kilometers, our heart remains in Zimbabwe. We're proud 
                to contribute to our local economy while sharing the world's tea culture with our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-12">Our Tea Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-dark-blue text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-medium mb-2">Ethical Sourcing</h3>
              <p className="text-gray-600">We partner with tea gardens that prioritize sustainable farming and fair labor practices.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-dark-blue text-4xl mb-4">✨</div>
              <h3 className="text-xl font-medium mb-2">Quality First</h3>
              <p className="text-gray-600">Only the finest tea leaves make it to your cup, carefully selected and imported from Germany.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-dark-blue text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-medium mb-2">Community Focus</h3>
              <p className="text-gray-600">Committed to enriching our Zimbabwean community through quality tea and shared experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-6">Experience the Giggles Tea Difference</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Join us in celebrating the art of tea. Discover our exclusive collection of premium teas, 
            each with its own story and character.
          </p>
          <Link 
            to="/products" 
            className="inline-block bg-dark-blue text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors"
          >
            Explore Our Teas
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;