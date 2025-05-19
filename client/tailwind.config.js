/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ribbon": {
          50: "#edf2ff",
          100: "#dee8ff",
          200: "#c4d3ff",
          300: "#a0b6ff",
          400: "#7a8cff",
          500: "#4a56f9",
          600: "#3f3cef",
          700: "#342fd3",
          800: "#2b29aa",
          900: "#292a86",
          950: "#18184e",
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
