import { useEffect, useMemo, useState } from "react";
import { Search, GripVertical, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Stores
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore";

// UI
import ViewCard from "@/components/ui/ViewCard";


export function FavoriteViews({ title, type, onlyFavorites = true }) {
  const navigate = useNavigate();
  
  const {
    favorites,
    fetchFavorites,
    updateFavoriteOrder,
    isLoading: favLoading,
  } = useFavoriteStore();
  const {
    powerBis,
    fetchPowerBis,
    deletePowerBi,
    isLoading: pbiLoading,
  } = usePowerBiStore();
  const { 
    layouts, 
    fetchLayouts, 
    deleteLayout,
    updateLayoutOrder, 
    isLoading: layoutLoading 
  } = useLayoutStore();
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFavorites();
    fetchPowerBis();
    fetchLayouts();
  }, []);

  const allDisplayData = useMemo(() => {
    const dataSource = type === "mypowerbi" ? powerBis : layouts;
    
    if (!onlyFavorites) {
      return dataSource.map(item => ({ ...item, favTableId: item.id }));
    }

    return favorites
      .filter((f) => f.type === type)
      .map((fav) => {
        const item = dataSource.find(
          (d) => Number(d.id) === Number(fav.object_id),
        );
        return item ? { ...item, favTableId: fav.id } : null;
      })
      .filter(Boolean);
  }, [favorites, type, powerBis, layouts, onlyFavorites]);

  const filteredData = useMemo(() => {
    return allDisplayData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allDisplayData, searchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allDisplayData.findIndex((i) => i.favTableId === active.id);
    const newIndex = allDisplayData.findIndex((i) => i.favTableId === over.id);
    const newArray = arrayMove(allDisplayData, oldIndex, newIndex);

    if (onlyFavorites) {
      updateFavoriteOrder(type, newArray.map((i) => i.favTableId));
    } else if (type === "mylayout") {
      await updateLayoutOrder(newArray);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Eliminar "${name}"?`)) return;

    try {
      if (type === "mypowerbi") {
        await deletePowerBi(id);
        await fetchPowerBis();
      } else if (type === "mylayout") {
        await deleteLayout(id);
        await fetchLayouts();
      }

      await fetchFavorites();
    } catch (err) {
      console.error("Error al eliminar desde ViewCard:", err);
      alert("No se pudo eliminar el elemento.");
    }
  };

  if (favLoading || pbiLoading || layoutLoading) {
    return (
      <div className="mb-8 rounded-[24px] border border-[#dce3e8] bg-white p-10 text-center text-[#8f919a]">
        <div className="animate-pulse font-medium">Cargando {title}...</div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {/* HEADER DE BUSQUEDA */}
      <div className="mb-8 rounded-[30px] border border-[#dce3e8] bg-white p-6 shadow-[0_18px_36px_-28px_rgba(31,41,55,0.14)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5f8] text-[#255f82]">
              <Radar className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#2f3440]">{title}</h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f919a]" />
            <input
              type="text"
              placeholder={`Filtrar ${title}...`}
              className="w-full rounded-2xl border border-[#d9e0e5] bg-[#f8fafc] py-3 pl-12 text-sm outline-none focus:border-[#255f82] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredData.map((i) => i.favTableId)} strategy={rectSortingStrategy}>
            {/* CORRECCIÓN: Volvemos a grid-cols-2 para que las tarjetas sean grandes */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:max-w-[1448px] mx-auto">
              {filteredData.map((item) => (
                <SortableWrapper
                  key={item.favTableId}
                  item={item}
                  type={type}
                  navigate={navigate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#dce3e8] bg-[#fbfcfd] py-16 text-center text-[#8f919a]">
          <p className="text-lg font-medium">No se encontraron {title.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}

function SortableWrapper({ item, type, navigate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.favTableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms cubic-bezier(0.2, 0, 0, 1)",
    zIndex: isDragging ? 50 : 0,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <ViewCard
        item={item}
        type={type}
        isDragging={isDragging}
        dragProps={{ ...attributes, ...listeners }}
        onView={(pbi) =>
          navigate(type === "mypowerbi" ? "/powerbi-view" : `/layout/${pbi.id}`, {
            state: type === "mypowerbi" ? { infoPowerBi: pbi } : { layoutInfo: pbi },
          })
        }
        onEdit={(pbi) => console.log("Editar", pbi)}
        onDelete={onDelete}
      />
    </div>
  );
}
