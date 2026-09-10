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
        brand: {
          50: "#F0F7FF",
          100: "#E0EFFE",
          200: "#B9DCFE",
          300: "#7CBDFD",
          400: "#3699FA",
          500: "#0066FF", // Suralink Electric Blue CTA
          600: "#0052CC",
          700: "#003D99",
          800: "#002966",
          900: "#0A1C30", // Deep Navy Dark
          950: "#061220", // Deepest Navy
        },
        navy: {
          50: "#f4f6f9",
          100: "#e9edf3",
          200: "#c7d2e2",
          300: "#95acc9",
          400: "#6081ac",
          500: "#3d5f8c",
          600: "#2d4970",
          700: "#243a59",
          800: "#1d2e46",
          900: "#0c1b2f",
          950: "#070f1b",
        },
        tealAccent: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(12, 27, 47, 0.05)",
        card: "0 2px 8px -1px rgba(12, 27, 47, 0.06), 0 1px 3px -1px rgba(12, 27, 47, 0.04)",
        "card-hover": "0 12px 28px -4px rgba(12, 27, 47, 0.12), 0 4px 12px -2px rgba(12, 27, 47, 0.08)",
        dropdown: "0 10px 30px -5px rgba(12, 27, 47, 0.15), 0 4px 10px -2px rgba(12, 27, 47, 0.05)",
        mockup: "0 20px 40px -15px rgba(10, 28, 48, 0.2), 0 0 0 1px rgba(12, 27, 47, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
