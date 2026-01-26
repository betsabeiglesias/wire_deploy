
import './styles/App.css'
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";

// Objeto de configuración con las URLs de los servicios.
export const SERVICE_URLS = {
  djangoApi: "http://localhost:8000/admin",
  chatbot: "http://localhost:5050/chat",
  mlService: "http://localhost:5000/predict",
  vrService: "http://localhost:6001/",
  grafana: "http://localhost:3000/login",
  influxDb: "http://localhost:8086/signin"
};

function App() {
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;