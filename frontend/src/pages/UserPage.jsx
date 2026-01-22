import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore"; // Asegúrate de que la ruta al store sea correcta
import HomeButton from "../components/HomeButton";

export default function UserPage() {
  // 1. Extraemos fetchCurrentUser (que es la función que añadimos al store) 
  // y cargamos los estados necesarios.
  const { user, fetchCurrentUser, loading, error } = useAuthStore();

  useEffect(() => {
    // 2. Ejecutamos la petición al backend de Django nada más cargar la página.
    // Como usamos tu instancia de Axios (api.js), el token va incluido automáticamente.
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 3. Gestión de estados de carga y error con Tailwind
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <span className="text-gray-500 animate-pulse">Cargando datos del perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-bold">Error al cargar el perfil:</p>
        <p>{error}</p>
      </div>
    );
  }

  // 4. Si el objeto user no tiene los datos extendidos (id, email, etc.) tras el fetch
  if (!user || !user.date_joined) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-yellow-50 text-yellow-700 rounded-lg">
        <p>No se han podido recuperar los detalles del perfil.</p>
      </div>
    );
  }

  return (
    <>
     <div className="absolute top-8 right-8 z-10">
        <HomeButton />
    </div>
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10 border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Perfil de Usuario
      </h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Nombre de Usuario */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Nombre de usuario</span>
          <span className="text-lg text-gray-900 font-medium">{user.username}</span>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Email</span>
          <span className="text-lg text-gray-900 font-medium">{user.email || "No proporcionado"}</span>
        </div>

        {/* Estado */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Estado de la cuenta</span>
          <div className="flex items-center mt-1">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${user.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className={`text-lg font-medium ${user.is_active ? "text-green-700" : "text-red-700"}`}>
              {user.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        {/* Fecha de Registro */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Fecha de registro</span>
          <span className="text-lg text-gray-900 font-medium">
            {new Date(user.date_joined).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Roles Especiales */}
        {(user.is_staff || user.is_superuser) && (
          <div className="flex gap-2 mt-2">
            {user.is_staff && (
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold uppercase">
                Staff
              </span>
            )}
            {user.is_superuser && (
              <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-bold uppercase">
                Superusuario
              </span>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}