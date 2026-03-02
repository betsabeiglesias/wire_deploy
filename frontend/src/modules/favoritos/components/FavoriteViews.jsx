import { useEffect, useMemo, useState } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";

// DND Kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function FavoriteViews({ title, type }) {
  const navigate = useNavigate();
  const { favorites, fetchFavorites, updateFavoriteOrder, isLoading: favLoading } = useFavoriteStore();
  const { powerBis, fetchPowerBis, isLoading: pbiLoading } = usePowerBiStore();
  const { layouts, fetchLayouts, isLoading: layoutLoading } = useLayoutStore();
  
  // Estado para el buscador local de esta sección
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFavorites();
    fetchPowerBis();
    fetchLayouts();
  }, []);

  // 1. Combinamos favoritos con sus datos reales (PBI o Layout)
  const allDisplayData = useMemo(() => {
    const dataSource = type === "mypowerbi" ? powerBis : layouts;
    return favorites
      .filter((f) => f.type === type)
      .map((fav) => {
        const item = dataSource.find((d) => Number(d.id) === Number(fav.object_id));
        // Mantenemos el objeto original (item) y le pegamos el ID de la relación (favTableId)
        return item ? { ...item, favTableId: fav.id } : null;
      })
      .filter(Boolean);
  }, [favorites, type, powerBis, layouts]);

  // 2. Filtramos los datos combinados según el término de búsqueda
  const filteredData = useMemo(() => {
    return allDisplayData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allDisplayData, searchTerm]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Calculamos el movimiento sobre la lista completa para no perder el orden de los no visibles
    const oldIndex = allDisplayData.findIndex((i) => i.favTableId === active.id);
    const newIndex = allDisplayData.findIndex((i) => i.favTableId === over.id);
    const newArray = arrayMove(allDisplayData, oldIndex, newIndex);

    updateFavoriteOrder(type, newArray.map(i => i.favTableId));
  };

  if (favLoading || pbiLoading || layoutLoading) return <p className="p-8 max-w-7xl mx-auto">Cargando {title}…</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        
        {/* Buscador específico para esta sección */}
        <input
          type="text"
          placeholder={`Buscar en ${title}...`}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none shadow-sm text-sm w-full max-w-xs transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredData.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredData.map(i => i.favTableId)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <SortableFavoriteCard 
                  key={item.favTableId} 
                  item={item} 
                  type={type} 
                  navigate={navigate} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="py-10">
          {allDisplayData.length > 0 ? (
            <p className="text-gray-400 italic">No se encontraron resultados para "{searchTerm}" en {title}.</p>
          ) : (
            <p className="text-gray-500 italic">No tienes {title.toLowerCase()} en favoritos.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-componente para manejar el estado de arrastre de cada tarjeta
function SortableFavoriteCard({ item, type, navigate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.favTableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    zIndex: isDragging ? 50 : 0,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all ${
        isDragging ? "opacity-50 scale-105 shadow-2xl ring-2 ring-green-500/20" : ""
      }`}
    >
      <div {...attributes} {...listeners} className="h-64 bg-white overflow-hidden relative border-b cursor-grab active:cursor-grabbing">
        {type === "mypowerbi" ? (
          item.embed_url ? (
            <iframe src={item.embed_url} title={item.name} frameBorder="0" allowFullScreen className="w-full h-full pointer-events-none" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">URL no disponible</div>
          )
        ) : (
          <iframe
            src={`/layout/${item.id}`}
            title={item.name}
            frameBorder="0"
            scrolling="yes"
            className="absolute top-0 left-0 border-0 origin-top-left pointer-events-none"
            style={{ width: "166.66%", height: "166.66%", transform: "scale(0.6)" }}
          />
        )}
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 truncate">{item.name}</h3>
        <p className="text-gray-600 text-sm flex-grow mb-4 line-clamp-2">{item.description || "Sin descripción."}</p>

        <div className="flex justify-end gap-3 border-t pt-3 mt-auto">
          <FavoriteHeart type={type} objectId={item.id} />
          <button
            onClick={() => navigate(
              type === "mypowerbi" ? "/powerbi-view" : `/layout/${item.id}`,
              { state: type === "mypowerbi" ? { infoPowerBi: item } : { layoutInfo: item } }
            )}
            className="px-3 py-1 text-sm font-medium text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition-all active:scale-95"
          >
            Ver
          </button>
        </div>
      </div>
    </div>
  );
}