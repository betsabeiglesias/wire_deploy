// src/services/api.js

import axios from "axios";
// 🔑 Importamos las funciones de autenticación
import { attemptRefreshToken, logout } from "./authService"; 

const api = axios.create({
  baseURL: "http://localhost:8000", 
  withCredentials: false,
});

// ----------------------------------------------------
// VARIABLES GLOBALES PARA MANEJAR EL ESTADO DEL REFRESH
// ----------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

// Función para añadir la petición fallida a la cola
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ----------------------------------------------------
// 1. INTERCEPTOR DE SOLICITUD (REQUEST) - Mantiene el token
// ----------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------
// 2. INTERCEPTOR DE RESPUESTA (RESPONSE) - Gestiona el 401
// ----------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la pasamos
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Comprobamos que sea un error 401 y que aún no hemos reintentado (para evitar bucles)
    if (error.response?.status === 401 && !originalRequest._retry) {
        
        // Si ya estamos refrescando, añadimos la petición fallida a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            // Una vez refrescado, reintentamos la petición original con el nuevo token
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
                // Si la cola falla (refresh token caducado), propagamos el error
                return Promise.reject(err); 
          });
        }

        // Si no estamos refrescando, iniciamos el proceso
        originalRequest._retry = true; // Marcamos la petición como reintentada
        isRefreshing = true;

        try {
          const newToken = await attemptRefreshToken();
          isRefreshing = false;
          processQueue(null, newToken); // Resolver peticiones en cola con el nuevo token
          
          // Reintentar la petición original
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Si el refresco falla (refresh token caducado o error de red)
            console.error("Interceptor: Falla total del Refresh Token.", refreshError);
          
            // 🛑 PASO 1: Ejecutar el LOGOUT (borra tokens y fuerza la redirección)
            logout(); 
            
            isRefreshing = false;
            processQueue(refreshError, null); // Rechazar peticiones en cola
          
            // 🛑 PASO 2: Devolver el error original para que el componente que hizo la
            // petición fallida (ej: Layout.jsx) sepa que no pudo obtener los datos.
            return Promise.reject(error); 
        }
    }
    
    // Para todos los demás errores, simplemente los devolvemos
    return Promise.reject(error);
  }
);

export default api;