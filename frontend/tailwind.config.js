/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
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
