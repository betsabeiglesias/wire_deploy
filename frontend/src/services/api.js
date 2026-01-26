import axios from 'axios';
import { refreshAccessToken } from './authService';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// 1. Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor para manejar errores (como el 401)
api.interceptors.response.use(
  (response) => response, // Si todo va bien, pasar la respuesta
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado reintentar ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar el token
        const newToken = await refreshAccessToken();
        
        // Actualizar el header y reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresco falla, el refresh_token expiró -> Logout forzoso
        useAuthStore.getState().clearAuth();
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;