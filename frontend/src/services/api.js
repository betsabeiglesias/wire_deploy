import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Crucial para cookies
});

// Interceptor de respuesta para manejar el refresco de token vía cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // En cookies, el refresh token ya está en el navegador. 
        // Solo llamamos al endpoint de refresh.
        await axios.post('http://localhost:8000/api/token/refresh/', {}, { withCredentials: true });
        
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;