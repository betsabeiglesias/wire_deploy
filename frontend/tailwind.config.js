/** @type {import('tailwindcss').Config} */
export default {
  // CRÍTICO: Configura 'content' para que escanee todos los archivos donde uses clases de Tailwind.
  // Esto incluye componentes React (.jsx, .tsx) y archivos HTML.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
