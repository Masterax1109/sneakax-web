/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.html",   // <-- ESTA LÍNEA ES LA CLAVE PARA QUE LEA TU HTML
    "./views/**/*.js",
    "./components/**/*.js",
    "./*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}