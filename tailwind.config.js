/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx}',
    './components/**/*.{astro,js,jsx,ts,tsx}',
    './pages/**/*.{astro,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: "#C51415",
      },
    },
  },
  plugins: [],
};
