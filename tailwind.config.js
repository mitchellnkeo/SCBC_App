/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          // Add your book club brand colors here
          primary: {
            50: '#fef2f2',
            500: '#dc2626',
            600: '#dc2626',
            700: '#b91c1c',
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