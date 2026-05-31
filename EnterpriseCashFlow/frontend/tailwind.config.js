/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1B2A4A',
        'primary-blue': '#2E6CF6',
        'warning-orange': '#F59E0B',
        'warning-red': '#EF4444',
        'success-green': '#10B981',
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
