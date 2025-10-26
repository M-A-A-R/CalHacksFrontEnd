/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Red Notebook Theme
        'notebook-red': '#DC2626',        // Primary red (red-600)
        'notebook-red-light': '#FEE2E2',  // Light red background (red-50)
        'notebook-red-dark': '#991B1B',   // Dark red for text (red-800)
        'notebook-red-accent': '#EF4444', // Accent red for highlights (red-500)
        'notebook-red-hover': '#B91C1C',  // Hover state (red-700)
        
        // Keep bio-primary for backward compatibility during transition
        'bio-primary': '#DC2626',  // Changed to red theme
        'bio-secondary': '#10B981',
        'bio-dark': '#1F2937',
        'bio-light': '#F3F4F6',
      },
    },
  },
  plugins: [],
}

