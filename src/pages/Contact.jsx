import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize EmailJS
  emailjs.init('1s2olhZ5Sccjt3jIh');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const templateParams = {
      from_name: form.current.user_name.value,
      from_email: form.current.user_email.value,
      message: form.current.message.value,
      to_email: 'smith.keithjohn@gmail.com'
    };

    emailjs.send(
      'service_7yqptst',
      'template_01pt9dj',
      templateParams
    )
      .then((result) => {
        setStatus({
          type: 'success',
          message: 'Thank you for your message. We will get back to you soon!'
        });
        form.current.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        setStatus({
          type: 'error',
          message: 'There was an error sending your message. Please try again.'
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-4xl font-light text-gray-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-light mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Visit Us</h3>
                  <p className="text-gray-600">
                    123 Tea Garden Lane<br />
                    New York, NY 10001
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 8:00 PM<br />
                    Saturday - Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Contact</h3>
                  <p className="text-gray-600">
                    Email: smith.keithjohn@gmail.com<br />
                    Phone: (555) 123-4567
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                {status.message && (
                  <div 
                    className={`p-4 rounded-md ${
                      status.type === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {status.message}
                  </div>
                )}
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="user_email"
                    name="user_email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gray-900 text-white px-6 py-3 rounded-md transition-colors ${
                    isSubmitting 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 