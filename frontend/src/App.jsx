import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocation } from "react-router-dom";
import { RealtimeProvider } from '@/realtime/RealtimeProvider';

function App() {
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const fetchModules = useAuthStore((s) => s.fetchModules);
  
  useEffect(() => {
    // 1. Verificamos si existe el rastro del usuario en el storage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Si no hay rastro, desactivamos el loading inmediatamente
      useAuthStore.setState({ loading: false });
      return;
    }

    // 2. Si hay rastro, validamos sesión y CARGAMOS MÓDULOS
    fetchCurrentUser().then((userData) => {
      if (userData) {
        fetchModules();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const needsRealtime = [
    "/scada",
    "/hmi",
    "/organizar-scada",
    "/scada/production",
  ].some((path) => location.pathname.startsWith(path));

  // Mientras se decide si el usuario está logueado o no, no renderizamos nada
  if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="text-blue-900 font-bold">Cargando sistema...</p>
            <small className="text-gray-400">Verificando módulos activos</small>
          </div>
        </div>
      );
    }

  if (!user) {
      return <AppRoutes />;
    }

  const tenant = user.client?.id;

  if (needsRealtime && !tenant) {
      return <div>Error: usuario sin cliente asignado</div>;
    }

  return (
    <>
      {needsRealtime ? (
        <RealtimeProvider tenant={tenant}>
          <AppRoutes />
        </RealtimeProvider>
      ) : (
        <AppRoutes />
      )}
    </>
  );
}

export default App;