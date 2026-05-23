/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        amber: {
          DEFAULT: "#F59E0B",
          soft: "#FCD34D",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
        serif: ["Noto Serif SC", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(245,158,11,0.35)",
      },
    },
  },
  plugins: [],
};
