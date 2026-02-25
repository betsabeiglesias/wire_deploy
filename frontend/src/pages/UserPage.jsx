import { useAuthStore } from "../store/useAuthStore";
import HomeButton from "../components/HomeButton";

export default function UserPage() {
  const { user, loading, error } = useAuthStore();

  // 1. Mientras esté cargando, mostramos spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <span className="text-gray-500 animate-pulse">Cargando datos del perfil...</span>
      </div>
    );
  }

  // 2. Si hay error en el store
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-bold">Error al cargar el perfil:</p>
        <p>{error}</p>
      </div>
    );
  }

  // 3. Validación de datos completos
  if (!user || !user.date_joined) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-yellow-50 text-yellow-700 rounded-lg">
        <p>No se han podido recuperar los detalles del perfil.</p>
        <p className="text-xs mt-2 italic text-yellow-600">Verifica que la sesión no haya expirado.</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SECCIÓN: DATOS PERSONALES */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-2">
              Datos Personales
            </h2>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold">Nombre de usuario</span>
              <span className="text-lg text-gray-900 font-medium">{user.username}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold">Email</span>
              <span className="text-lg text-gray-900 font-medium">{user.email || "No proporcionado"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold">Fecha de registro</span>
              <span className="text-lg text-gray-900 font-medium">
                {new Date(user.date_joined).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* SECCIÓN: DATOS DE EMPRESA (CLIENTE) */}
          <div className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-sm font-black text-green-600 uppercase tracking-widest border-l-4 border-green-600 pl-2">
              Afiliación Industrial
            </h2>

            {user.client ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-bold">Empresa / Cliente</span>
                  <span className="text-lg text-gray-900 font-bold">{user.client.name}</span>
                  <span className="text-xs text-gray-500 font-mono">ID: {user.client.id}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-bold">Tu Rol</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold border border-green-200">
                      {user.client.role_display}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">No tienes un cliente asignado.</p>
            )}

            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold">Estado de cuenta</span>
              <div className="flex items-center mt-1">
                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${user.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                <span className={`text-sm font-bold ${user.is_active ? "text-green-700" : "text-red-700"}`}>
                  {user.is_active ? "ACTIVA" : "INACTIVA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Técnicos (Staff/Admin) */}
        {(user.is_staff || user.is_superuser) && (
          <div className="flex gap-2 mt-8 pt-4 border-t border-gray-100">
            {user.is_staff && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-black uppercase">
                Staff IT
              </span>
            )}
            {user.is_superuser && (
              <span className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded font-black uppercase">
                Admin Sistema
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}