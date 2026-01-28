import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  // --- ESTADO INICIAL ---
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  // Importante: Empezamos en true si hay un rastro de usuario para evitar saltos
  loading: !!localStorage.getItem('user'), 
  error: null,

  setAuth: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, loading: false, error: null });
  },

  fetchCurrentUser: async () => {
    // Si no hay rastro de usuario en localStorage, no hace falta validar
    if (!localStorage.getItem('user')) {
      set({ loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await api.get('/api/me/');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error("❌ [AuthStore] Error de validación:", err.response?.status);
      // Solo limpiamos si es un error de autenticación real
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, loading: false });
      } else {
        // Si es error de red o 500, mantenemos lo que tenemos pero quitamos loading
        set({ loading: false });
      }
    }
  },

  clearAuth: async () => {
    try {
      await api.post('/api/logout/');
    } catch (err) {
      console.warn("Error en logout backend", err);
    } finally {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, loading: false });
      window.location.href = '/login';
    }
  },

  clearError: () => set({ error: null }),
}));