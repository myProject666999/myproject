/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2D1B69',
        accent: '#FFD166',
        success: '#06D6A0',
        dark: '#0F0E17',
        card: '#1A1A2E',
      },
    },
  },
  plugins: [],
};
