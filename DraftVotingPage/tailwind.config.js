/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f19",
        bgElev: "#121829",
        neon: {
          purple: "#7c3aed",
          pink: "#ec4899",
          cyan: "#22d3ee",
          gold: "#fbbf24"
        }
      },
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        sans: ["Noto Sans SC", "system-ui", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 24px rgba(124, 58, 237, 0.5), 0 0 48px rgba(236, 72, 153, 0.25)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 24px rgba(124,58,237,.4)" },
          "50%": { boxShadow: "0 0 48px rgba(236,72,153,.6)" }
        }
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
