import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Obligatorio para enviar/recibir cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y NO viene de la ruta de login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/token/')) {
      originalRequest._retry = true;

      try {
        // En cookies, no enviamos nada en el body. El navegador envía la cookie 'refresh_token' sola.
        await axios.post('http://localhost:8000/api/token/refresh/', {}, { withCredentials: true });
        
        // Si el refresh tiene éxito, reintentamos la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (ej: cookie expirada), limpiamos todo y al login
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;