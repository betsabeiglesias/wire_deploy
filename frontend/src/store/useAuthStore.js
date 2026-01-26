import { create } from 'zustand';
import { useFavoriteStore } from './useFavoriteStore';

export const useAuthStore = create((set) => ({
  // Estado inicial: leemos de localStorage para persistir tras recargar
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Acción para cuando el login es exitoso
  setAuth: (user, token, refresh) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  // Acción para limpiar todo (Logout)
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    useFavoriteStore.getState().clearFavorites(); // <-- Limpia los datos del usuario anterior
    set({ user: null, isAuthenticated: false });
  },
}));