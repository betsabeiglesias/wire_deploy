import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "../../../components/FavoriteHeart";
import Sidebar from "../../sidebar/Sidebar";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useThemeStore } from "../../../store/useThemeStore";

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

export default function Layout() {
  const navigate = useNavigate();
  const {
    layouts: storeLayouts,
    fetchLayouts,
    deleteLayout,
    updateLayoutOrder,
    isLoading,
  } = useLayoutStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";
  const [layouts, setLayouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLayouts();
  }, []);

  useEffect(() => {
    setLayouts(storeLayouts);
  }, [storeLayouts]);

  const filteredLayouts = useMemo(() => {
    return layouts.filter((layout) =>
      layout.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [layouts, searchTerm]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    try {
      await deleteLayout(id);
      setLayouts((prev) => prev.filter((layout) => layout.id !== id));
    } catch (err) {
      alert("Error al eliminar el layout");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layouts.findIndex((layout) => layout.id === active.id);
    const newIndex = layouts.findIndex((layout) => layout.id === over.id);
    const reorderedLayouts = arrayMove(layouts, oldIndex, newIndex);

    setLayouts(reorderedLayouts);

    try {
      await updateLayoutOrder(reorderedLayouts);
    } catch (error) {
      setLayouts(storeLayouts);
      alert("No se pudo guardar el nuevo orden");
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <section className={`relative px-6 py-6 md:px-8 md:py-8 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className={`absolute inset-0 ${isDark ? "opacity-35 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)] [background-size:8px_8px]" : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]"}`} />
              <div className={`absolute right-[-30px] top-[-20px] h-[240px] w-[240px] rounded-full ${isDark ? "bg-[radial-gradient(circle,rgba(114,176,255,0.16),transparent_70%)]" : "bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)]"}`} />

              <div className="relative z-10 flex justify-start">
                <div className="max-w-3xl xl:pl-2">
                  <h1 className={`mt-4 max-w-2xl text-left text-4xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-6xl ${isDark ? "text-white" : "text-[#464851]"}`}>
                    Tus
                    <br />
                    <span className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}>layouts.</span>
                  </h1>
                </div>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <h2 className="text-2xl font-semibold">Layouts</h2>

                  <div className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en layouts..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-11 text-sm outline-none shadow-sm transition-all focus:ring-2 focus:ring-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {isLoading && (
                  <p className="p-4 text-sm text-[#8f919a]">
                    Cargando layouts...
                  </p>
                )}

                {!isLoading && filteredLayouts.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredLayouts.map((layout) => layout.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLayouts.map((layout) => (
                          <SortableItem
                            key={layout.id}
                            layout={layout}
                            onDelete={handleDelete}
                            navigate={navigate}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {!isLoading &&
                  layouts.length > 0 &&
                  filteredLayouts.length === 0 && (
                    <div className="py-10">
                      <p className="text-gray-400 italic">
                        No se encontraron SCADAs con el nombre "{searchTerm}".
                      </p>
                    </div>
                  )}

                {!isLoading && layouts.length === 0 && (
                  <div className="py-10">
                    <p className="text-gray-500 italic">
                      No tienes layouts creados todavía.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SortableItem({ layout, onDelete, navigate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layout.id });

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
          {layout.name}
        </h3>
      </div>

      <div className="relative h-44 overflow-hidden border-b border-[#eef1f5] bg-[#f3f6fb]">
        <iframe
          src={`/layout/${layout.id}`}
          title={layout.name}
          frameBorder="0"
          scrolling="yes"
          className="absolute top-0 left-0 border-0 origin-top-left"
          style={{
            width: "166.66%",
            height: "166.66%",
            transform: "scale(0.6)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,255,0.08)_0%,rgba(248,250,255,0)_40%,rgba(255,255,255,0.78)_100%)]" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6d7482] shadow-[0_12px_24px_-18px_rgba(31,41,55,0.2)]">
          Vista previa
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between border-t border-[#eef1f5] pt-4">
          <FavoriteHeart type="mylayout" objectId={layout.id} />

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/layout/${layout.id}`);
              }}
              className="rounded-2xl bg-[#343841] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#272b33]"
            >
              Abrir vista
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(layout.id, layout.name);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d7dc] bg-[#fff8f9] text-[#cf4b68] transition hover:bg-[#fff1f3]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
