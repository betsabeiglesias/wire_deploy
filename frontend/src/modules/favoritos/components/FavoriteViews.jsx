import { useEffect, useMemo, useState } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";

// DND Kit
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

export function FavoriteViews({ title, type }) {
  const navigate = useNavigate();
  const {
    favorites,
    fetchFavorites,
    updateFavoriteOrder,
    isLoading: favLoading,
  } = useFavoriteStore();
  const { powerBis, fetchPowerBis, isLoading: pbiLoading } = usePowerBiStore();
  const { layouts, fetchLayouts, isLoading: layoutLoading } = useLayoutStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFavorites();
    fetchPowerBis();
    fetchLayouts();
  }, []);

  const allDisplayData = useMemo(() => {
    const dataSource = type === "mypowerbi" ? powerBis : layouts;
    return favorites
      .filter((f) => f.type === type)
      .map((fav) => {
        const item = dataSource.find(
          (d) => Number(d.id) === Number(fav.object_id),
        );
        return item ? { ...item, favTableId: fav.id } : null;
      })
      .filter(Boolean);
  }, [favorites, type, powerBis, layouts]);

  const filteredData = useMemo(() => {
    return allDisplayData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allDisplayData, searchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allDisplayData.findIndex(
      (i) => i.favTableId === active.id,
    );
    const newIndex = allDisplayData.findIndex((i) => i.favTableId === over.id);
    const newArray = arrayMove(allDisplayData, oldIndex, newIndex);

    updateFavoriteOrder(
      type,
      newArray.map((i) => i.favTableId),
    );
  };

  if (favLoading || pbiLoading || layoutLoading) {
    return <p className="p-8 max-w-7xl mx-auto">Cargando {title}...</p>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>

        <input
          type="text"
          placeholder={`Buscar en ${title}...`}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none shadow-sm text-sm w-full max-w-xs transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredData.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredData.map((i) => i.favTableId)}
            strategy={rectSortingStrategy}
          >
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
            <p className="text-gray-400 italic">
              No se encontraron resultados para "{searchTerm}" en {title}.
            </p>
          ) : (
            <p className="text-gray-500 italic">
              No tienes {title.toLowerCase()} en favoritos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SortableFavoriteCard({ item, type, navigate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.favTableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition || "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    zIndex: isDragging ? 50 : 0,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-[28px] border border-[#e8eaef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] shadow-[0_22px_40px_-28px_rgba(31,41,55,0.18)] flex flex-col transition-all ${
        isDragging
          ? "opacity-60 scale-[1.02] shadow-[0_28px_52px_-26px_rgba(31,41,55,0.24)] ring-2 ring-[#79c8f1]/20"
          : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab border-b border-[#eef1f5] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3 active:cursor-grabbing"
      >
        <h3 className="truncate text-center text-lg font-semibold tracking-[-0.03em] text-[#2f3440]">
          {item.name}
        </h3>
      </div>

      <div className="relative h-44 overflow-hidden border-b border-[#eef1f5] bg-[#f3f6fb]">
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
            <div className="flex items-center justify-center h-full text-gray-500">
              URL no disponible
            </div>
          )
        ) : (
          <iframe
            src={`/layout/${item.id}`}
            title={item.name}
            frameBorder="0"
            scrolling="yes"
            className="absolute top-0 left-0 border-0 origin-top-left"
            style={{
              width: "166.66%",
              height: "166.66%",
              transform: "scale(0.6)",
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,255,0.08)_0%,rgba(248,250,255,0)_40%,rgba(255,255,255,0.78)_100%)]" />

        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6d7482] shadow-[0_12px_24px_-18px_rgba(31,41,55,0.2)]">
          Vista previa
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between border-t border-[#eef1f5] pt-4">
          <FavoriteHeart type={type} objectId={item.id} />

          <button
            onClick={() =>
              navigate(
                type === "mypowerbi" ? "/powerbi-view" : `/layout/${item.id}`,
                {
                  state:
                    type === "mypowerbi"
                      ? { infoPowerBi: item }
                      : { layoutInfo: item },
                },
              )
            }
            className="rounded-2xl bg-[#343841] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#272b33]"
          >
            Abrir vista
          </button>
        </div>
      </div>
    </div>
  );
}
