import paulVincent from '../assets/paul-vincent-roll-c61jL_NpAn8-unsplash.webp'
import teaCollection from '../assets/DSC00284-removebg-preview.png'
import homeSection from '../assets/home-section.png'
import ProductsCarousel from '../components/Products'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] flex items-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${paulVincent})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
              Experience the Art of <br />
              <span className="font-medium">Fine Tea</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Discover our carefully curated collection of premium teas, 
              sourced from the world's finest tea gardens.
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Explore Our Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Giggles Tea Experience Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-light text-gray-900 mb-6">The Giggles Tea Experience</h2>
            <div className="w-24 h-0.5 bg-gray-200 mx-auto mb-12"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={teaCollection} 
                alt="Giggles Tea Collection" 
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-8">
                <h3 className="text-xl font-medium text-gray-900 mb-3">A Symphony of Flavors</h3>
                <p className="text-gray-600">Each sip of Giggles Tea is a celebration of carefully balanced flavors, from delicate floral notes to rich, full-bodied infusions that dance on your palate.</p>
              </div>

              <div className="border-b border-gray-100 pb-8">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Mindful Sourcing</h3>
                <p className="text-gray-600">We forge direct relationships with small-scale tea farmers, ensuring fair trade practices and the highest quality leaves for your cup.</p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Moments of Joy</h3>
                <p className="text-gray-600 mb-6">More than just tea, we create experiences that bring people together, one perfect cup at a time.</p>
                <Link 
                  to="/products" 
                  className="inline-flex items-center text-gray-900 hover:text-indigo-600 font-medium transition-colors duration-200"
                >
                  Explore Our Collection
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tea Growing Section */}
      <section className="relative py-24 bg-cover bg-center" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${homeSection})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">The Art of Tea Cultivation</h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Discover the journey of our premium teas, from the misty hills where they're grown to the perfect cup in your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white bg-opacity-90 rounded-lg p-8 transform transition-transform duration-300 hover:scale-105">
              <div className="text-dark-blue text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Nurtured in Nature</h3>
              <p className="text-gray-700">
                Our tea plants thrive in the perfect balance of altitude, soil, and climate, absorbing the essence of their pristine environments.
              </p>
            </div>

            <div className="bg-white bg-opacity-90 rounded-lg p-8 transform transition-transform duration-300 hover:scale-105">
              <div className="text-dark-blue text-4xl mb-4">👐</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Handpicked with Care</h3>
              <p className="text-gray-700">
                Each leaf is carefully selected by skilled hands, ensuring only the finest quality makes it into your cup.
              </p>
            </div>

            <div className="bg-white bg-opacity-90 rounded-lg p-8 transform transition-transform duration-300 hover:scale-105">
              <div className="text-dark-blue text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Sustainable Practices</h3>
              <p className="text-gray-700">
                We're committed to sustainable farming that respects the land and supports local tea-growing communities.
              </p>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-light text-gray-900 mb-4">Experience the Journey</h3>
            <p className="text-gray-700 max-w-3xl mx-auto mb-8">
              Join us in celebrating the rich tradition and craftsmanship behind every cup of Giggles Tea. 
            </p>
            <Link 
              to="/about" 
              className="inline-block bg-dark-blue hover:bg-opacity-90 text-white px-8 py-3 rounded-md transition-colors duration-200"
            >
              Learn More About Our Process
            </Link>
          </div>
        </div>
      </section>

      {/* Products Carousel Section */}
      <div className="bg-gray-50">
        <ProductsCarousel />
      </div>
    </div>
  );
};

export default Home; 