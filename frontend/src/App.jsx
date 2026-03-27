import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { RealtimeProvider } from '@/context/RealtimeProvider';
import { ScadaConfigProvider } from './context/ScadaConfigProvider';

function App() {
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
  }, [fetchCurrentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  // Caso 1: No hay usuario (Login)
  if (!user) {
    return <AppRoutes />;
  }

  const tenant = user.client?.id;

  // Caso 2: Usuario logueado pero sin cliente asignado
  if (!tenant) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Error: usuario sin cliente asignado. Contacte con el administrador.</p>
      </div>
    );
  }

  // Caso 3: Usuario OK -> Providers fijos + Rutas
  return (
    <ScadaConfigProvider>
      <RealtimeProvider tenant={tenant}>
        <AppRoutes />
      </RealtimeProvider>
    </ScadaConfigProvider>
  );
}

export default App;




// estaba asi: 

// import './styles/App.css';
// import AppRoutes from './routes/AppRoutes';
// import { useEffect } from "react";
// import { useAuthStore } from "@/store/useAuthStore";
// import { useLocation } from "react-router-dom";
// import { RealtimeProvider } from '@/context/RealtimeProvider';
// import { ScadaConfigProvider } from './context/ScadaConfigProvider';
// import { shallow } from 'zustand/shallow';

// function App() {
//   const location = useLocation();

//   const user = useAuthStore((s) => s.user);
//   const loading = useAuthStore((s) => s.loading);
//   const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  
//   useEffect(() => {
//     // 1. Verificamos si existe el rastro del usuario en el storage antes de pedir nada
//     const storedUser = localStorage.getItem('user');
    
//     if (!storedUser) {
//       // Si no hay rastro, desactivamos el loading inmediatamente 
//       // para mostrar el login sin intentar llamar a la API (evita el 401)
//       useAuthStore.setState({ loading: false });
//       return;
//     }

//     // 2. Si hay rastro, entonces sí validamos si la cookie/sesión sigue activa
//     fetchCurrentUser();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
  
//   const needsRealtime = [
//     "/scada",
//     "/hmi",
//     //"/organizar-scada",
//     "/scada/production",
//   ].some((path) => location.pathname.startsWith(path));



//   // Mientras se decide si el usuario está logueado o no, no renderizamos nada
//   // para evitar que las rutas protegidas redirijan al login por error.
//   if (loading) {
//       return (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//           <p>Cargando sistema...</p>
//         </div>
//       );
//     }

//   if (!user) {
//       return <AppRoutes />;
//     }

//     const tenant = user.client?.id;

//   if (needsRealtime && !tenant) {
//       return <div>Error: usuario sin cliente asignado</div>;
//     }

//   return (
//   <>
//   <ScadaConfigProvider>
//     {needsRealtime ? (
//       <RealtimeProvider tenant={tenant}>
//         <AppRoutes />
//       </RealtimeProvider>
//     ) : (
//       <AppRoutes />  // 🚩 AL ENTRAR A /organizar-scada, ENTRA AQUÍ
//     )}
//     </ScadaConfigProvider>
//   </>
// );
// }

// export default App;



// import './styles/App.css'
// import AppRoutes from './routes/AppRoutes';
// import { useLocation } from "react-router-dom";
// import { useEffect } from "react";
// import { useAuthStore } from "@/store/useAuthStore";
// import { RealtimeProvider } from '@/realtime/RealtimeProvider';

// function App() {
//   const location = useLocation();

//   const {
//     user,
//     isAuthenticated,
//     loading,
//     fetchCurrentUser,
//   } = useAuthStore();

//   console.log("AUTH USER:", user);
//   // Al cargar la app, validamos sesión
//   useEffect(() => {
//     fetchCurrentUser();
//   }, [fetchCurrentUser]);

//   const needsRealtime = [
//     "/scada",
//     "/hmi",
//     "/organizar-scada",
//     "/scada/production",
//   ].some((path) => location.pathname.startsWith(path));

//   // Mientras validamos sesión
//   if (loading) {
//     return <div>Cargando sesión…</div>;
//   }

//   // No autenticado
//   if (!isAuthenticated || !user) {
//     return <AppRoutes />; // o LoginRedirect, según tu app
//   }

//   const tenant = user.client?.id;

//   // Seguridad extra (muy bien ponerla)
//   if (needsRealtime && !tenant) {
//     return <div>Error: usuario sin cliente asignado</div>;
//   }

//   return (
//     <>
//       {needsRealtime ? (
//         <RealtimeProvider tenant={tenant}>
//           <AppRoutes />
//         </RealtimeProvider>
//       ) : (
//         <AppRoutes />
//       )}
//     </>
//   );
// }

// export default App;