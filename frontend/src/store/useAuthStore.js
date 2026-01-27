import { create } from 'zustand';
import { useFavoriteStore } from './useFavoriteStore';
import api from '../services/api'; // Asegúrate de que esta ruta a tu axios sea correcta

export const useAuthStore = create((set) => ({
  // Estado inicial: leemos de localStorage para persistir tras recargar
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Acción para cuando el login es exitoso
  setAuth: (user, token, refresh) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, error: null });
  },

  // Obtener datos frescos del usuario desde Django (/api/me/)
  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      // Usamos tu endpoint exacto definido en urls.py
      const response = await api.get('/api/me/');
      const userData = response.data;

      // Actualizamos localStorage con los datos completos (date_joined, etc.)
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (err) {
      console.error("Error en fetchCurrentUser:", err);
      set({ 
        error: err.response?.data?.detail || "No se pudo obtener el perfil del usuario", 
        loading: false 
      });
    }
  },

  // Acción para limpiar todo (Logout)
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Limpiamos también el estado de favoritos
    useFavoriteStore.getState().clearFavorites();
    
    set({ 
      user: null, 
      isAuthenticated: false, 
      loading: false, 
      error: null 
    });
  },
}));