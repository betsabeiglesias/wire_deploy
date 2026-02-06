import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: true, // Importante: empieza en true para validar la sesión al arrancar
  error: null,

  setAuth: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, loading: false, error: null });
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      // Intentamos obtener el usuario (la cookie viaja sola por withCredentials)
      const response = await api.get('/api/auth/me/');
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
      return userData;
    } catch (err) {
      // Si falla (401), limpiamos rastro de usuario
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  clearAuth: async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (err) {
      console.warn("Sesión ya cerrada o error en logout");
    } finally {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, loading: false });
      window.location.href = '/login';
    }
  },
}));