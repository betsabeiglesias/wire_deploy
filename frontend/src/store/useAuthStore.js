import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,              // ⬅️ empieza en false
  error: null,
  hasBootstrapped: false,      // ⬅️ CLAVE

  // 🔹 USADO POR Login.jsx (NO LO TOCAMOS)
  setAuth: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({
      user: userData,
      isAuthenticated: true,
      loading: false,
      error: null,
      hasBootstrapped: true,
    });
  },

  // 🔹 Bootstrap de sesión (cookies)
  fetchCurrentUser: async () => {
    const { loading, hasBootstrapped, user } = get();

    // ⛔️ evita loops
    if (loading || hasBootstrapped) return;

    set({ loading: true });

    try {
      const response = await api.get('/api/auth/me/');
      const userData = response.data;

      // ⛔️ no notificar si es el mismo usuario
      if (user && user.id === userData.id) {
        set({ loading: false, hasBootstrapped: true });
        return user;
      }

      localStorage.setItem('user', JSON.stringify(userData));
      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        hasBootstrapped: true,
      });

      return userData;
    } catch (err) {
      // ⛔️ si ya estamos en null, no volver a setear
      if (user === null) {
        set({ loading: false, hasBootstrapped: true });
        return null;
      }

      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        hasBootstrapped: true,
      });

      return null;
    }
  },

  // 🔹 Logout explícito
  clearAuth: async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (err) {
      console.warn("Logout en backend fallido o sesión ya expirada");
    } finally {
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        hasBootstrapped: true,
      });
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