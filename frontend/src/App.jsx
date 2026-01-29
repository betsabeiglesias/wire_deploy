import './styles/App.css'
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function App() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    // Al cargar la app, si hay sesión (cookie), traemos los datos frescos
    fetchCurrentUser();
  }, [fetchCurrentUser]); 

  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;