/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': {
          DEFAULT: '#1e3a5f',
          light: '#2d5a87',
          dark: '#152a44'
        },
        'amber-gold': '#f59e0b',
        'warm-white': '#faf8f5',
        'ink-dark': '#1a1a2e'
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
