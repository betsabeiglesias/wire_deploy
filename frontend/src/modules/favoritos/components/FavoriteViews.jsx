import { useEffect, useMemo, useState } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Search } from "lucide-react";

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
    return (
      <div className="rounded-[28px] border border-[#ececee] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
        <p className="text-sm text-[#8f919a]">Cargando {title}...</p>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-[28px] border border-[#ececee] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)] last:mb-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#8f919a]">Favorite views</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#3b3d45]">
            {title}
          </h2>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa0ac]" />
          <input
            type="text"
            placeholder={`Buscar en ${title}...`}
            className="w-full rounded-2xl border border-[#e5e6ea] bg-[#fafafb] py-3 pl-11 pr-4 text-sm text-[#444955] outline-none transition focus:border-[#cfd6e3] focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="rounded-2xl border border-dashed border-[#e4e6eb] bg-[#fafafb] px-5 py-10 text-center">
          {allDisplayData.length > 0 ? (
            <p className="text-sm italic text-[#8f919a]">
              No se encontraron resultados para "{searchTerm}" en {title}.
            </p>
          ) : (
            <p className="text-sm italic text-[#8f919a]">
              No tienes {title.toLowerCase()} en favoritos.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function SortableFavoriteCard({ item, type, navigate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.favTableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition || "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    zIndex: isDragging ? 50 : 0,
    position: "relative",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-[24px] border border-[#ececee] bg-[#fbfbfc] shadow-[0_18px_34px_-26px_rgba(31,41,55,0.14)] transition-all ${
        isDragging
          ? "scale-[1.02] opacity-70 shadow-[0_24px_40px_-24px_rgba(31,41,55,0.2)]"
          : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between border-b border-[#eef1f5] bg-white px-4 py-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 text-[#8f919a]">
          <GripVertical className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            Reordenar
          </span>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden border-b border-[#eef1f5] bg-white">
        {type === "mypowerbi" ? (
          item.embed_url ? (
            <iframe
              src={item.embed_url}
              title={item.name}
              frameBorder="0"
              allowFullScreen
              className="h-full w-full pointer-events-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#8f919a]">
              URL no disponible
            </div>
          )
        ) : (
          <iframe
            src={`/layout/${item.id}`}
            title={item.name}
            frameBorder="0"
            scrolling="yes"
            className="absolute left-0 top-0 origin-top-left border-0 pointer-events-none"
            style={{
              width: "166.66%",
              height: "166.66%",
              transform: "scale(0.6)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className="p-5">
        <h3 className="truncate text-2xl font-semibold tracking-[-0.03em] text-[#33363f]">
          {item.name}
        </h3>
        <div className="mt-5 flex items-center justify-between border-t border-[#eef1f5] pt-4">
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
            className="rounded-xl border border-[#e5e6ea] bg-[#fafafb] px-4 py-2 text-sm font-medium text-[#33363f] transition hover:bg-white"
          >
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}
