import { useEffect, useMemo } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore"; 
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";

export function FavoriteViews({ title, type }) {
  const navigate = useNavigate();

  const { favorites, fetchFavorites, isLoading: favLoading } = useFavoriteStore();
  const { powerBis, fetchPowerBis, isLoading: pbiLoading } = usePowerBiStore();
  const { layouts, fetchLayouts, isLoading: layoutLoading } = useLayoutStore();

  useEffect(() => {
    fetchFavorites();
    fetchPowerBis();
    fetchLayouts();
  }, []);

  const favoriteObjectIds = useMemo(
    () => favorites.filter((f) => f.type === type).map((f) => f.object_id),
    [favorites, type]
  );

  const displayData = useMemo(() => {
    const dataSource = type === "mypowerbi" ? powerBis : layouts;
    return dataSource.filter((item) => favoriteObjectIds.includes(item.id));
  }, [type, powerBis, layouts, favoriteObjectIds]);

  if (favLoading || pbiLoading || layoutLoading) return <p>Cargando {title}…</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {displayData.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                {/* Miniatura: Iframe para PowerBI o Iframe para la ruta del Layout */}
                <div className="h-64 bg-white overflow-hidden relative border-b">
                  {type === "mypowerbi" ? (
                    item.embed_url ? (
                      <iframe
                        src={item.embed_url}
                        title={item.name}
                        frameBorder="0"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="p-4 text-center text-gray-500">URL no disponible</div>
                    )
                  ) : (
                    /* Para Layouts, usamos la ruta interna /layout/id */
                    <iframe
                      src={`/layout/${item.id}`}
                      title={item.button_name}
                      frameBorder="0"
                      scrolling="yes"
                      className="absolute top-0 left-0 border-0 origin-top-left pointer-events-auto"
                      style={{
                        width: "166.66%",
                        height: "166.66%",
                        transform: "scale(0.6)",
                      }}
                    />
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {type === "mypowerbi" ? item.name : item.button_name}
                  </h3>

                  <p className="text-gray-600 text-sm flex-grow mb-4">
                    {item.description || "Sin descripción."}
                  </p>

                  <div className="flex justify-end gap-3 border-t pt-3">
                    <FavoriteHeart type={type} objectId={item.id} />

                    <button
                      onClick={() =>
                        navigate(type === "mypowerbi" ? "/powerbi-view" : `/layout/${item.id}`, {
                          state: type === "mypowerbi" ? { infoPowerBi: item } : { layoutInfo: item },
                        })
                      }
                      className="px-3 py-1 text-sm font-medium text-green-700 border border-green-700 rounded-md hover:bg-green-50"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {displayData.length === 0 && (
        <p className="text-gray-500 italic">No tienes {title.toLowerCase()} en favoritos.</p>
      )}
    </div>
  );
}
