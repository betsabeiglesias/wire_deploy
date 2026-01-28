import './styles/App.css'
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";

function App() {
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Solo pedimos favoritos si el usuario está autenticado
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