import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    {
      pattern: /^(bg|text|border|ring|from|to)-(arc|surface|gold)-(50|100|200|300|400|500|600|700|800|900|950|0)$/,
    },
  ],
  theme: {
    extend: {
      colors: {
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
        // Warm gold accent for highlights / success states
        gold: {
          50:  "#fdf8ef",
          100: "#faecd1",
          200: "#f3d79e",
          300: "#eabd66",
          400: "#dfa23c",
          500: "#c9882a", // accent
          600: "#a66b21",
          700: "#7d501c",
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
      boxShadow: {
        premium: "0 1px 2px rgba(16,13,56,0.04), 0 8px 24px -4px rgba(16,13,56,0.10)",
        "premium-lg": "0 4px 12px rgba(16,13,56,0.06), 0 16px 40px -8px rgba(16,13,56,0.14)",
      },
      backgroundImage: {
        "premium-radial": "radial-gradient(120% 120% at 50% -10%, #f0f0ff 0%, #f7f7fb 55%, #ffffff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;