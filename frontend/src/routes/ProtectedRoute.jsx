// src/routes/ProtectedRoute.jsx (Final)

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
// 🛑 IMPORTANTE: Solo importamos la función de chequeo activa.
import { checkTokenHealth } from '../services/authService'; 

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // Usamos la acción interna de logout, que solo limpia el store
    const logoutAction = useAuthStore((state) => state.logout); 
    
    const [isVerifying, setIsVerifying] = useState(true); 
    const location = useLocation();

    // 🔑 CLAVE: Chequeo Activo y Centralizado (La directriz global)
    useEffect(() => {
        // Si Zustand ya dice que no hay sesión, terminamos el chequeo.
        if (!isAuthenticated) {
            setIsVerifying(false);
            return;
        }

        const verifyActiveToken = async () => {
            setIsVerifying(true);
            const isValid = await checkTokenHealth(); 

            if (!isValid) {
                // Si checkTokenHealth falla (el token está caducado y el Interceptor 
                // ya ha disparado navigateTo y el evento global)
                // Forzamos la limpieza del store local por si acaso.
                logoutAction(); 
            }
            setIsVerifying(false);
        };

        verifyActiveToken();
        // Dispara la verificación al cargar, y en cada cambio de ruta protegida.
    }, [isAuthenticated, location.pathname, logoutAction]); 

    // 🛑 Listener de Eventos - Ya no es necesario aquí. 
    // Lo movimos a useAuthStore.js para romper la dependencia circular.

    // 3. Lógica de Renderizado
    if (isVerifying) {
        return <div className="full-screen-loader">Verificando Credenciales...</div>; 
    }

    if (!isAuthenticated) {
        // Redirige si el chequeo de salud falló y actualizó Zustand.
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;