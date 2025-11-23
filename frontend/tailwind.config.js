/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // use 'class' to toggle manually
  content: [
    // App directory and components under src
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    // Fallbacks in case files exist at the project root
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
