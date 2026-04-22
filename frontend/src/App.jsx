import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocation } from "react-router-dom";
import { RealtimeProvider } from '@/context/RealtimeProvider';
import { ScadaConfigProvider } from './context/ScadaConfigProvider';

function App() {
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      useAuthStore.setState({ loading: false });
      return;
    }
    fetchCurrentUser();
  }, []);
  
  const needsRealtime = [
    "/scada",
    "/hmi",
    "/scada/production",
  ].some((path) => location.pathname.startsWith(path));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sistema...</p>
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
    <ScadaConfigProvider>
      {needsRealtime ? (
        <RealtimeProvider tenant={tenant}>
          <AppRoutes />
        </RealtimeProvider>
      ) : (
        <AppRoutes />
      )}
    </ScadaConfigProvider>
  );
}

export default App;
