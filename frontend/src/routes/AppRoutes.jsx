import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

// --- COMPONENTES CORE (SOLO LO QUE NO ES MÓDULO) ---
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import UserPage from "@/pages/UserPage";
import SavedPage from "@/pages/SavedPage";
import SettingsPage from "@/pages/SettingsPage";
import TaskExample from "@/pages/TaskExample";

// 1. ESCÁNEO AUTOMÁTICO DE MÓDULOS
// Busca todos los index.js dentro de la carpeta modules
const moduleFiles = import.meta.glob('../modules/*/index.js', { eager: true });
const registeredModules = Object.values(moduleFiles).map(m => m.default);

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />

      {/* RUTAS CORE (PROTEGIDAS) */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/task" element={<ProtectedRoute><TaskExample /></ProtectedRoute>} />

      {/* RUTAS DINÁMICAS (Mapeo de los index.js) */}
      {registeredModules.map((mod) => 
        mod.routes?.map((route) => (
          <Route
            key={`${mod.id}-${route.path}`}
            path={route.path}
            element={
              <ProtectedRoute>
                <route.component />
              </ProtectedRoute>
            }
          />
        ))
      )}

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}