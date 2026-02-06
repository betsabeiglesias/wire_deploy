import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function App() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    // Al cargar la web por primera vez, verificamos si la cookie es válida
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Mientras se decide si el usuario está logueado o no, no renderizamos nada
  // para evitar que las rutas protegidas redirijan al login por error.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;