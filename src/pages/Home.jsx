import paulVincent from '../assets/paul-vincent-roll-c61jL_NpAn8-unsplash.jpg'
import teaCollection from '../assets/DSC00284-removebg-preview.png'
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
        <div className="container mx-auto px-4">
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

      {/* Experience Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-16">The Giggles Tea Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src={teaCollection} 
                alt="Tea Collection" 
                className="rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-2">Artisanal Craftsmanship</h3>
                <p className="text-gray-600">Every cup tells a story of dedication, from carefully selected leaves to perfectly timed steeping.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Sustainable Sourcing</h3>
                <p className="text-gray-600">We partner directly with tea gardens that share our commitment to quality and environmental stewardship.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Tea Education</h3>
                <p className="text-gray-600">Join our weekly tastings and workshops to deepen your appreciation for the world's finest teas.</p>
              </div>
              <Link 
                to="/about" 
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors mt-4"
              >
                About Our Journey
              </Link>
            </div>
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