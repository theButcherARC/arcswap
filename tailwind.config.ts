import type { Config } from "tailwindcss";

const config: Config = {
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy palettes from the superseded dark theme. Still referenced
        // by live components, so they stay until those migrate to tokens:
        // arc-500 (Spinner border), surface-800 (NetworkGuard text).
        // Premium deep-indigo / midnight palette
        arc: {
          50:  "#f0f0ff",
          100: "#e3e2ff",
          200: "#c5c3ff",
          300: "#a09cff",
          400: "#7c6fff",
          500: "#5b4cf5", // primary — rich violet-indigo
          600: "#4736d6",
          700: "#3829b0",
          800: "#291f86",
          900: "#1b1559",
          950: "#100d38",
        },
        // Neutral surface palette — softer, warmer dark
        surface: {
          0:   "#ffffff",
          25:  "#fcfcfe",
          50:  "#f7f7fb",
          100: "#eeeef5",
          200: "#dcdce8",
          300: "#b5b5c9",
          800: "#1e1c2e",
          900: "#13111f",
          950: "#0a0915",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;