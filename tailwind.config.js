/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#9B2342",
          light: "#7A1A34",
          accent: "#C43B5E"
        },
        whatsapp: "#25D366"
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"]
      }
    }
  },
  plugins: []
};
