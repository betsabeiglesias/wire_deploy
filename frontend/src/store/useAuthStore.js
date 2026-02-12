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
    // 1. COMPROBACIÓN PREVIA: Si no hay usuario en localStorage, 
    // cancelamos la petición antes de enviarla para evitar el 401
    if (!localStorage.getItem('user')) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }

    set({ loading: true });
    try {
      // Intentamos obtener el usuario (la cookie viaja sola por withCredentials)
      const response = await api.get('/api/auth/me/');
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
      return userData;
    } catch (err) {
      // Si falla (token caducado o error), limpiamos
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



// import { create } from 'zustand';
// import api from '../services/api';

// export const useAuthStore = create((set, get) => ({
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   isAuthenticated: !!localStorage.getItem('user'),
//   loading: false,
//   error: null,

//   setAuth: (userData) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     set({ user: userData, isAuthenticated: true, loading: false, error: null });
//   },

//   fetchCurrentUser: async () => {
//     // Si no hay rastro de usuario, no intentamos nada
//     if (!localStorage.getItem('user') && !get().isAuthenticated) {
//       return null;
//     }

//     set({ loading: true });
//     try {
//       const response = await api.get('/api/me/');
//       const userData = response.data;
      
//       localStorage.setItem('user', JSON.stringify(userData));
//       set({ user: userData, isAuthenticated: true, loading: false, error: null });
//       return userData;
//     } catch (err) {
//       console.error("❌ Error validando sesión:", err.response?.status);
      
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         localStorage.removeItem('user');
//         set({ user: null, isAuthenticated: false, loading: false });
//       } else {
//         set({ loading: false });
//       }
//       return null;
//     }
//   },

//   clearAuth: async () => {
//     try {
//       await api.post('/api/logout/');
//     } catch (err) {
//       console.warn("Logout en backend fallido o sesión ya expirada");
//     } finally {
//       localStorage.removeItem('user');
//       set({ user: null, isAuthenticated: false, loading: false });
//       window.location.href = '/login';
//     }
//   },

//   clearError: () => set({ error: null }),
// }));