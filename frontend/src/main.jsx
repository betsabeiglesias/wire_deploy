// src/main.jsx (Código Completo con Solución)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom' // 👈 AÑADIMOS useNavigate
import React, { useEffect } from 'react'; // 👈 AÑADIMOS React y useEffect
import { navigateRef } from './services/router'; // 👈 IMPORTACIÓN CLAVE

import './styles/index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';
import HomeButton from './components/HomeButton.jsx'

// 🛑 COMPONENTE DE INICIALIZACIÓN DE NAVEGACIÓN
// Este componente usa el hook useNavigate y pasa la función a la referencia global
function AppNavigationInitializer() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Esto permite que authService.js (fuera del contexto de React)
        // pueda forzar la redirección con navigateTo()
        navigateRef.current = navigate;
    }, [navigate]);

    return null; // No renderiza nada visible
}

createRoot(document.getElementById('root')).render(
//   <StrictMode>
    <BrowserRouter>        
      <link
        href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
        rel="stylesheet"
      />
      
      {/* 🔑 INYECTAMOS el inicializador dentro del Router */}
      <AppNavigationInitializer /> 
      
      <App />
    </BrowserRouter>
//   </StrictMode>
)