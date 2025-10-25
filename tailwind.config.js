/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bio-primary': '#3B82F6',
        'bio-secondary': '#10B981',
        'bio-dark': '#1F2937',
        'bio-light': '#F3F4F6',
      },
    },
  },
  plugins: [],
}

