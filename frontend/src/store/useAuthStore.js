import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  activeModules: [], // Lista de módulos habilitados en el .env de Django
  loading: true,

  setAuth: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, loading: false, error: null });
  },

  // Función para obtener los módulos dinámicos del backend
  fetchModules: async () => {
    try {
      const response = await api.get('/api/auth/modules/');
      set({ activeModules: response.data.modules || [] });
    } catch (err) {
      console.error("Error al obtener módulos activos:", err);
      set({ activeModules: [] });
    }
  },

  fetchCurrentUser: async () => {
    if (!localStorage.getItem('user')) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }

    set({ loading: true });
    try {
      const response = await api.get('/api/auth/me/');
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
      
      // Al validar el usuario con éxito, disparamos la carga de módulos
      get().fetchModules();
      
      return userData;
    } catch (err) {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, loading: false, activeModules: [] });
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
      set({ user: null, isAuthenticated: false, loading: false, activeModules: [] });
      window.location.href = '/login';
    }
  },
}));