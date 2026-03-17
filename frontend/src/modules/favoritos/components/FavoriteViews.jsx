import { useEffect, useMemo, useState } from "react";
import { Search, GripVertical, Radar, TriangleAlert } from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";

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
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";
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
      <div
        className={`mb-8 rounded-[24px] px-5 py-4 text-sm ${
          isDark
            ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
            : "border border-[#dce3e8] bg-white text-[#8f919a]"
        }`}
      >
        Cargando {title}...
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div
        className={`mb-6 rounded-[26px] px-5 py-5 ${
          isDark
            ? "border border-[#21415f] bg-[linear-gradient(145deg,#0c1721_0%,#101c27_100%)]"
            : "border border-[#dce3e8] bg-white"
        }`}
      >
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2">
              <Radar
                className={`h-4 w-4 ${isDark ? "text-[#89dfff]" : "text-[#255f82]"}`}
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  isDark ? "text-[#89dfff]" : "text-[#255f82]"
                }`}
              >
                {type === "mypowerbi" ? "Analitica" : "Layout HMI"}
              </span>
            </div>

            <h2
              className={`mt-3 text-3xl font-semibold tracking-[-0.05em] ${
                isDark ? "text-white" : "text-[#2f3440]"
              }`}
            >
              {title}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto]">
            <div className="relative w-full">
              <Search
                className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isDark ? "text-[#7f95ab]" : "text-[#8f919a]"
                }`}
              />
              <input
                type="text"
                placeholder={`Buscar en ${title}...`}
                className={`w-full rounded-2xl px-4 py-3 pl-11 text-sm outline-none transition ${
                  isDark
                    ? "border border-[#21415f] bg-[#0d1d2a] text-white shadow-[0_18px_30px_-28px_rgba(0,0,0,0.34)] placeholder:text-[#7f95ab] focus:border-[#7cd7ff]"
                    : "border border-[#d9e0e5] bg-white text-[#2f3942] shadow-[0_18px_30px_-28px_rgba(31,41,55,0.16)] focus:border-[#79c8f1]"
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
                isDark
                  ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
                  : "border border-[#dce3e8] bg-white text-[#667380]"
              }`}
            >
              <GripVertical className="h-4 w-4" />
              Reordenar
            </div>
          </div>
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
            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
              {filteredData.map((item) => (
                <SortableFavoriteCard
                  key={item.favTableId}
                  item={item}
                  type={type}
                  navigate={navigate}
                  isDark={isDark}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className={`rounded-[24px] px-6 py-8 text-center ${
            isDark
              ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
              : "border border-[#dce3e8] bg-white text-[#8f919a]"
          }`}
        >
          {allDisplayData.length > 0 ? (
            <p>
              No se encontraron resultados para "{searchTerm}" en {title}.
            </p>
          ) : (
            <p>No tienes {title.toLowerCase()} en favoritos.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SortableFavoriteCard({ item, type, navigate, isDark }) {
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
      className={`overflow-hidden rounded-[28px] transition-all ${
        isDark
          ? "border border-[#21415f] bg-[linear-gradient(180deg,#0c1721_0%,#101c27_100%)] shadow-[0_26px_58px_-34px_rgba(0,0,0,0.58)]"
          : "border border-[#dce3e8] bg-white shadow-[0_24px_42px_-28px_rgba(31,41,55,0.18)]"
      } ${
        isDragging
          ? "scale-[1.01] opacity-80 ring-2 ring-[#79c8f1]/25"
          : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center justify-between border-b px-4 py-3 cursor-grab active:cursor-grabbing ${
          isDark
            ? "border-[#21415f] bg-[linear-gradient(90deg,rgba(124,215,255,0.08),rgba(124,215,255,0.02))]"
            : "border-[#eef1f5] bg-[#fbfcfd]"
        }`}
      >
        <div className="inline-flex items-center gap-2">
          <GripVertical
            className={`h-4 w-4 ${isDark ? "text-[#89dfff]" : "text-[#255f82]"}`}
          />
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isDark ? "text-[#89dfff]" : "text-[#255f82]"
            }`}
          >
            {type === "mypowerbi" ? "Power BI" : "Modulo SCADA"}
          </span>
        </div>

        <div className="inline-flex items-center gap-2">
          <TriangleAlert
            className={`h-4 w-4 ${isDark ? "text-[#f1cf80]" : "text-[#8f6a18]"}`}
          />
          <span
            className={`text-[11px] uppercase tracking-[0.14em] ${
              isDark ? "text-[#d7e6f4]" : "text-[#6d7482]"
            }`}
          >
            Favorito
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className={`relative h-64 overflow-hidden border-b lg:h-auto lg:border-b-0 lg:border-r ${
            isDark ? "border-[#21415f] bg-[#09131c]" : "border-[#eef1f5] bg-[#f3f6fb]"
          }`}
        >
          {type === "mypowerbi" ? (
            item.embed_url ? (
              <iframe
                src={item.embed_url}
                title={item.name}
                frameBorder="0"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div
                className={`flex h-full items-center justify-center ${
                  isDark ? "text-[#a5b7ca]" : "text-gray-500"
                }`}
              >
                URL no disponible
              </div>
            )
          ) : (
            <iframe
              src={`/layout/${item.id}`}
              title={item.name}
              frameBorder="0"
              scrolling="yes"
              className="absolute left-0 top-0 origin-top-left border-0"
              style={{
                width: "166.66%",
                height: "166.66%",
                transform: "scale(0.6)",
              }}
            />
          )}
          <div
            className={`pointer-events-none absolute inset-0 ${
              isDark
                ? "bg-[linear-gradient(180deg,rgba(7,13,20,0.04)_0%,rgba(7,13,20,0)_45%,rgba(7,13,20,0.74)_100%)]"
                : "bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.8)_100%)]"
            }`}
          />
          <div
            className={`pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
              isDark
                ? "border border-[#21415f] bg-[#0b1a26] text-[#89dfff]"
                : "border border-[#dce3e8] bg-white text-[#6d7482]"
            }`}
          >
            Preview activa
          </div>
        </div>

        <div className="flex flex-col justify-between p-5">
          <div>
            <h3
              className={`truncate text-3xl font-semibold tracking-[-0.05em] ${
                isDark ? "text-white" : "text-[#2f3440]"
              }`}
            >
              {item.name}
            </h3>

            <p
              className={`mt-4 text-sm leading-7 ${
                isDark ? "text-[#a7b9c9]" : "text-[#6b7681]"
              }`}
            >
              {type === "mypowerbi"
                ? "Dashboard listo para lectura analitica, acceso continuo y consulta rapida desde la zona de favoritos."
                : "Entorno de visualizacion tecnica para seguimiento de proceso, navegacion entre vistas y acceso a la capa operativa del layout."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-[18px] px-4 py-4 ${
                  isDark
                    ? "border border-[#21415f] bg-[#0c1620]"
                    : "border border-[#eef1f5] bg-[#fafbfc]"
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-[0.14em] ${
                    isDark ? "text-[#7f95ab]" : "text-[#88919c]"
                  }`}
                >
                  Tipo
                </p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    isDark ? "text-white" : "text-[#2f3440]"
                  }`}
                >
                  {type === "mypowerbi" ? "Analitica" : "Produccion"}
                </p>
              </div>

              <div
                className={`rounded-[18px] px-4 py-4 ${
                  isDark
                    ? "border border-[#4b4328] bg-[#1e1a10]"
                    : "border border-[#ece3c6] bg-[#fffaf0]"
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-[0.14em] ${
                    isDark ? "text-[#bba469]" : "text-[#8f6a18]"
                  }`}
                >
                  Estado
                </p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    isDark ? "text-[#f1cf80]" : "text-[#6d5113]"
                  }`}
                >
                  Supervisado
                </p>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 flex items-center justify-between border-t pt-5 ${
              isDark ? "border-[#21415f]" : "border-[#eef1f5]"
            }`}
          >
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
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                isDark
                  ? "bg-[#7cd7ff] text-[#0d2337] hover:bg-[#95e0ff]"
                  : "bg-[#194b68] text-white hover:bg-[#215f82]"
              }`}
            >
              Abrir vista
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
