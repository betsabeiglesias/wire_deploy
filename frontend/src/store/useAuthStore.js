

import { create } from 'zustand';
import api from "../services/api"; 

// --- Inicialización del Estado Persistente ---
const getInitialAuthState = () => {
    const hasToken = !!localStorage.getItem('token'); 
    const storedUsername = sessionStorage.getItem('username');

    return {
        user: hasToken && storedUsername ? { username: storedUsername } : null,
        isAuthenticated: hasToken
    };
};

// --- Creación del Store ---
export const useAuthStore = create((set, get) => ({
    // Estado inicial (Preservado)
    ...getInitialAuthState(),
    
    // Acciones/Funciones (Preservadas)
    
    login: (username) => {
        set({ 
            user: { username }, 
            isAuthenticated: true 
        });
        console.log("Zustand: Usuario logueado en el store.");
    },

    // 🔑 Cierre de Sesión (Preservado)
    logout: () => {
        set({ 
            user: null, 
            isAuthenticated: false 
        });
        console.log("Zustand: Cierre de sesión y estado limpiado.");
    },
    
    // Función de sincronización (Preservada)
    syncLogoutFromEvent: () => {
        if (!localStorage.getItem('token')) {
            get().logout(); 
        }
    },

    // --- NUEVA FUNCIÓN AÑADIDA ---
    fetchCurrentUser: async () => {
        try {
            const res = await api.get("/api/me/"); 
            // Esto sobrescribe el { username } básico con el objeto completo del backend
            set({ user: res.data });
        } catch (error) {
            console.error("Error cargando perfil", error);
        }
    }
}));


// --- Listener Global para Eventos de Expiración (Preservado) ---

if (typeof window !== 'undefined') {
    window.addEventListener('sessionExpired', () => {
        useAuthStore.getState().syncLogoutFromEvent();
    });
}