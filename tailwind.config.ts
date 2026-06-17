import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arc brand palette — adjust once Arc Testnet branding is confirmed
        arc: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#bdd1ff",
          300: "#85a8ff",
          400: "#4d7aff",
          500: "#1a4dff", // primary
          600: "#0033e6",
          700: "#0028b8",
          800: "#001f8f",
          900: "#001570",
        },
        // Neutral surface palette
        surface: {
          0:   "#ffffff",
          50:  "#f8f9fb",
          100: "#f0f2f6",
          200: "#e2e6ef",
          800: "#1c2030",
          900: "#111420",
          950: "#080a12",
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
