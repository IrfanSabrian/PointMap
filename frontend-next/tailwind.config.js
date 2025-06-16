/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#34729C",
        secondary: "#6CB1DA",
        accent: "#D1ECFF",
        dark: "#1E5470",
        tosca: "#6EC1D1",
        toscaLight: "#C8EAEC",
      },
    },
  },
  plugins: [],
};
