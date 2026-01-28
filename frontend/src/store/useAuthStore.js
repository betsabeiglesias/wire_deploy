import { create } from 'zustand';
import { useFavoriteStore } from './useFavoriteStore';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  // Solo persistimos la info básica del usuario para UI, no el token.
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,
  error: null,

  // Al loguear, el backend ya habrá seteado la cookie. 
  // Aquí solo guardamos la info del perfil (roles, cliente, etc.)
  setAuth: (userData) => {
    console.log("SET_AUTH: Guardando datos en LocalStorage", userData);
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, error: null });
  },

  // Carga el perfil completo desde el endpoint /api/me/
  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/me/');
      const userData = response.data;

      console.log("FETCH_USER: Datos recibidos del servidor", userData);

      localStorage.setItem('user', JSON.stringify(userData));
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (err) {
      console.error("Error cargando usuario:", err);
      localStorage.removeItem('user');
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        error: "Sesión no válida o expirada"
      });
    }
  },

  // Logout: Limpia el perfil y los favoritos.
  clearAuth: async () => {
    try {
      await api.post('/api/logout/');
    } catch (err) {
      console.warn("Logout en backend falló o ya estaba cerrado", err);
    } finally {
      // Limpiamos SIEMPRE el cliente, aunque falle la red
      localStorage.removeItem('user');
      // Si tienes el store de favoritos, lo limpiamos
      if (useFavoriteStore.getState().clearFavorites) {
        useFavoriteStore.getState().clearFavorites();
      }
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null 
      });
    }
  },
}));