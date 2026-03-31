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
    extend: {
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
    },
  },
  plugins: [],
}
};

