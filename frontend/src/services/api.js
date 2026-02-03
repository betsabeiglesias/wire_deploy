import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Variable para evitar colisiones de refresco
let isRefreshing = false;
let lastRetry = 0;

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Crucial para enviar las cookies HttpOnly
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Si el error NO es 401, o es una petición de login/refresh, no hacemos nada
    if (
      error.response?.status !== 401 || 
      originalRequest.url.includes('api/auth/token/') || 
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // 2. Control de inundación: Si intentamos refrescar hace menos de 2 segundos, abortamos
    const now = Date.now();
    if (now - lastRetry < 2000) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    lastRetry = now;

    try {
      // 3. Intentar renovar la sesión (el refresh_token va en la cookie)
      await axios.post(
        'http://localhost:8000/api/auth/token/refresh/', 
        {}, 
        { withCredentials: true }
      );
      
      // 4. Si el refresh tiene éxito, reintentamos la petición original
      return api(originalRequest);
      
    } catch (refreshError) {
      // 5. Si el refresh falla (cookie caducada o borrada), limpieza total y al login
      console.error("❌ Sesión expirada. Limpiando...");
      useAuthStore.getState().clearAuth();
      
      // Forzamos redirección solo si no estamos ya en el login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
  }
);

export default api;