import './styles/App.css'
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";

function App() {
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // 1. Verificación obligatoria al cargar la aplicación
    // Esto actualizará el estado 'loading' de true a false
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    // 2. Solo pedimos favoritos si el usuario está autenticado
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;