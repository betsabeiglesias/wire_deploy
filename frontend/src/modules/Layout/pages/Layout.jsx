import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../../../components/HomeButton";
import FavoriteHeart from "../../../components/FavoriteHeart";
import { useLayoutStore } from "@/store/useLayoutStore";

export default function Layout() {
  const navigate = useNavigate();
  const { layouts, fetchLayouts, deleteLayout, isLoading } = useLayoutStore();

  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      try {
        await deleteLayout(id);
      } catch (err) {
        alert("Error al eliminar el layout");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Contenedor para posicionar el botón a la derecha que sube con el scroll */}
      <div className="absolute top-8 right-8 z-10">
        <HomeButton />
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mt-10 mb-16 text-gray-800">Mis SCADA</h1>

        {isLoading && <p className="text-gray-500">Cargando layouts...</p>}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200"
            >
              {/* MINIATURA INTERACTIVA */}
              <div className="h-64 bg-white overflow-hidden relative border-b">
                <iframe
                  src={`/layout/${layout.id}`}
                  title={`preview-${layout.id}`}
                  className="absolute top-0 left-0 border-0 origin-top-left pointer-events-auto"
                  style={{
                    width: '166.66%', 
                    height: '166.66%',
                    transform: 'scale(0.6)',
                  }}
                />
              </div>

              <div className="p-5 flex-grow">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                  {layout.button_name}
                </h2>
              </div>

              <div className="flex items-center justify-start gap-3 p-4 border-t bg-gray-50">
                <FavoriteHeart type="mylayout" objectId={layout.id} />

                <button
                  onClick={() => navigate(`/layout/${layout.id}`)}
                  className="
                    px-6 py-1.5 text-sm font-semibold
                    text-green-700
                    border border-green-600
                    rounded-lg
                    hover:bg-green-50
                    hover:border-green-700
                    hover:text-green-800
                    transition-colors
                  "
                >
                  Ver pantalla completa
                </button>

                <button
                  onClick={() => handleDelete(layout.id, layout.button_name)}
                  className="
                    px-4 py-1.5 text-sm font-medium
                    text-red-600
                    border border-red-600
                    rounded-lg
                    hover:bg-red-50
                    hover:text-red-700
                    hover:border-red-700
                    transition-colors
                    ml-auto
                  "
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </section>

        {!isLoading && layouts.length === 0 && (
          <p className="text-gray-400 italic">No tienes layouts creados todavía.</p>
        )}
      </main>
    </div>
  );
}