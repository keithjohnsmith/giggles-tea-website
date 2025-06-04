import React from 'react';
import teaShop from '../assets/paul-vincent-roll-c61jL_NpAn8-unsplash.jpg';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${teaShop})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-light text-white mb-4">Our Story</h1>
          <p className="text-xl text-gray-200">Crafting exceptional tea experiences since 2010</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <h2 className="text-3xl font-light mb-6">Our Journey</h2>
              <p className="mb-6">
                Founded in 2010, Giggles Tea House began with a simple passion: to share the finest teas 
                from around the world with our community. What started as a small tea room has grown into 
                a beloved destination for tea enthusiasts and casual sippers alike.
              </p>

              <h3 className="text-2xl font-light mb-4">Our Philosophy</h3>
              <p className="mb-6">
                We believe that every cup of tea tells a story. From the misty mountains where our leaves 
                are harvested to the moment it's poured into your cup, we ensure that each step of the 
                journey maintains the quality and character of our teas.
              </p>

              <h3 className="text-2xl font-light mb-4">Our Commitment</h3>
              <p className="mb-6">
                We're committed to:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Sourcing directly from sustainable tea gardens</li>
                <li>Supporting fair trade practices</li>
                <li>Maintaining the highest quality standards</li>
                <li>Creating memorable tea experiences</li>
                <li>Educating our community about tea culture</li>
              </ul>

              <h3 className="text-2xl font-light mb-4">Visit Us</h3>
              <p className="mb-6">
                We invite you to visit our tea house, where you can experience our carefully curated 
                selection of teas in a warm and welcoming atmosphere. Our knowledgeable staff is always 
                ready to guide you through our collection and help you discover your perfect cup of tea.
              </p>
            </div>

            {/* Team Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-light text-center mb-12">Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Team Member Cards */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200"></div>
                  <h3 className="text-xl font-medium mb-2">Sarah Chen</h3>
                  <p className="text-gray-600">Founder & Tea Master</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200"></div>
                  <h3 className="text-xl font-medium mb-2">James Wilson</h3>
                  <p className="text-gray-600">Tea Sommelier</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200"></div>
                  <h3 className="text-xl font-medium mb-2">Maria Garcia</h3>
                  <p className="text-gray-600">Store Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 