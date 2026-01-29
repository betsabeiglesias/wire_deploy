import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  // ⏳ MIENTRAS VALIDA: No redirigimos, esperamos.
  if (loading) {
    return <div className="loading-screen">Validando sesión...</div>; 
  }

  // 🚫 SI TERMINÓ Y NO ESTÁ AUTENTICADO: Al login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ TODO OK
  return children;
};

export default ProtectedRoute;