import axios from "axios"; 
import { navigateTo } from "./router"; // ⬅️ Asegurar que este módulo exista
import api from './api'; // ⬅️ Asegurar que api.js exista

// 🔑 CLAVE: La URL base de tu backend (Django)
const BASE_URL = "http://localhost:8000"; 

export function logout() { 
  console.log("¡Sesión expirada! Forzando redirección a /login...");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  sessionStorage.removeItem("loggedIn"); 
  
  // 1. FORZAMOS la navegación inmediata
  navigateTo("/login", { replace: true }); 
  
  // 2. Dispara el evento global (para avisar al store de Zustand)
  window.dispatchEvent(new Event("sessionExpired")); 
}

export async function login(username, password) {
  try {
    // Utilizamos la URL cableada (localhost:8000)
    const response = await axios.post(`${BASE_URL}/api/token/`, { username, password });
    
    localStorage.setItem("token", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("username", username)
    return response.data;

  } catch (error) {
    throw error;
  }
}

export async function attemptRefreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token available.");

  try {
    // Utilizamos la URL cableada (localhost:8000)
    const res = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh });
    
    localStorage.setItem("token", res.data.access);
    return res.data.access; 
  } catch (error) {
    throw error; 
  }
}

export async function checkSessionStatus() {
    const refresh = localStorage.getItem("refresh");
    
    if (!refresh) {
        return false; 
    }

    try {
        await attemptRefreshToken();
        return true; 
    } catch (error) {
        return false;
    }
}

// 🔑 CLAVE: FUNCIÓN PARA EL CHEQUEO DE SEGURIDAD CENTRALIZADO
export async function checkTokenHealth() {
    try {
        // Usa el API de Axios (con Interceptor), que activará el logout() si hay 401
        await api.get('http://localhost:8000/api/auth/check/'); 
        return true; // Token válido
    } catch (error) {
        // El Interceptor ya maneja el 401 (ejecutando logout() + navigateTo()).
        return false; 
    }
}