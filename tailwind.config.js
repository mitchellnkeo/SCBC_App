/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          // Add your book club brand colors here
          primary: {
            50: '#fdf2f8',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
          },
          secondary: {
            50: '#f0f9ff',
            500: '#0ea5e9',
            600: '#0284c7',
          }
        }
      },
    },
    plugins: [],
  }