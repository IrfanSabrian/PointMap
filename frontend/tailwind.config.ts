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
        surface: {
          DEFAULT: "#ffffff",
          dark: "#232946",
        },
        muted: {
          DEFAULT: "#6c757d",
          dark: "#b8c1ec",
        },
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
        sans: ["var(--font-inter)"],
        heading: ["var(--font-plus-jakarta)"],
      },
    },
  },
  plugins: [],
};
export default config;
