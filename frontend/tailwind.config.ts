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
          DEFAULT: "#1e3a8a", // blue-900 (lebih biru tua dari sebelumnya)
          dark: "#60a5fa", // blue-400 (tetap terang tapi tidak terlalu putih)
        },
        accent: {
          DEFAULT: "#3b82f6", // blue-500 (biru standar yang jelas)
          dark: "#93c5fd", // blue-300 (biru muda soft)
        },
        background: {
          DEFAULT: "#f8fafc", // slate-50 (putih tulang/abu sangat muda, bukan putih murni)
          dark: "#0f172a", // slate-900 (biru gelap pekat)
        },
        "background-dark": "#0f172a",
        surface: {
          DEFAULT: "#e2e8f0", // slate-200 (abu muda, jelas beda dari putih)
          dark: "#1e293b", // slate-800 (abu tua kebiruan)
        },
        "surface-dark": "#1e293b",
        muted: {
          DEFAULT: "#64748b", // slate-500
          dark: "#94a3b8", // slate-400
        },
        "muted-dark": "#94a3b8",
        error: {
          DEFAULT: "#ef4444", // red-500
          dark: "#f87171", // red-400
        },
        // legacy/kompatibilitas
        secondary: "#3b82f6", // blue-500
        tosca: "#0ea5e9", // sky-500
        toscaLight: "#e0f2fe", // sky-100
        dark: "#0f172a", // slate-900
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
