import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // 👈 Esto define @ como alias de /src
    },
  },
  server: {
    host: '0.0.0.0', // El contenedor escucha en todas las interfaces
    port: 5173,
    proxy: {

      // SCADA config (EDGE)
      '/api/config/': {
        target: 'http://core-backendA:8000',
        changeOrigin: true,
      },

      // resto de APIs (CENTRAL)
      '/api/': {
        target: 'http://django-api:8000',
        changeOrigin: true,
      }

    },
    watch: {
      usePolling: true,
      interval: 1000,
      depth: 10,
    },
  //   // 💡 NUEVO Y CRÍTICO: Configuración de HMR
    hmr: {
      // Le dice al navegador que se conecte a localhost (o 127.0.0.1)
      // en lugar del nombre interno del container (e.g., frontend).
      host: 'localhost', 
    },
  },
});
