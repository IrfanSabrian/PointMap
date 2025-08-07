import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1d3557", // biru navy
          dark: "#3a86ff", // biru terang untuk dark mode
        },
        accent: {
          DEFAULT: "#a8dadc", // biru muda
          dark: "#f6c177", // gold soft accent
        },
        background: {
          DEFAULT: "#f1faee", // abu muda
          dark: "#181926", // biru navy gelap
        },
        "background-dark": "#181926", // alias untuk dark mode
        surface: {
          DEFAULT: "#ffffff",
          dark: "#232946",
        },
        "surface-dark": "#232946", // alias untuk dark mode
        muted: {
          DEFAULT: "#6c757d",
          dark: "#b8c1ec",
        },
        "muted-dark": "#b8c1ec", // alias untuk dark mode
        error: {
          DEFAULT: "#e63946",
          dark: "#ff6b6b",
        },
        // legacy/kompatibilitas
        secondary: "#6CB1DA",
        tosca: "#6EC1D1",
        toscaLight: "#C8EAEC",
        dark: "#1E5470",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-oswald)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
