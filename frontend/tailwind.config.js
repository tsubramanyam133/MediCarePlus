/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d6efd",
        secondary: "#00c6ff",
        accent: "#ffe600",
        dark: "#333",
        light: "#f5f9ff"
      }
    },
  },
  plugins: [],
}
