import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,
  error: null,

  setAuth: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, error: null });
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/api/me/');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
    } catch (err) {
      // Si falla, es que la cookie no es válida
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  clearAuth: async () => {
    try {
      await api.post('/api/logout/');
    } catch (err) {
      console.warn("Error en logout backend", err);
    } finally {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, error: null });
      window.location.href = '/login';
    }
  },
}));