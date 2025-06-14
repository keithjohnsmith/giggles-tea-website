/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1A213E',
        // You can add more custom colors here
      },
      fontFamily: {
        // You can add your custom fonts here
      },
      keyframes: {
        notification: {
          '0%': { 
            transform: 'translateY(100%)',
            opacity: '0'
          },
          '15%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
          '85%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateY(100%)',
            opacity: '0'
          },
        }
      },
      animation: {
        'notification': 'notification 2s ease-in-out forwards'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 