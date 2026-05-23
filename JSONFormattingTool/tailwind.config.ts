import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0d0d1a",
        surface: "#1a1a2e",
        "surface-light": "#252542",
        primary: "#00d9ff",
        secondary: "#7c3aed",
        accent: "#f472b6",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
        border: "#374151",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow: "0 0 5px rgba(0, 217, 255, 0.5)",
          },
          "100%": {
            boxShadow: "0 0 20px rgba(0, 217, 255, 0.8)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
