import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  GripVertical,
  Radar,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Estas seguro de eliminar "${name}"?`)) return;

    try {
      await deleteLayout(id);
      setLayouts((prev) => prev.filter((layout) => layout.id !== id));
    } catch (err) {
      alert("Error al eliminar el layout");
    }
  };

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

  const statusCards = [
    {
      label: "Layouts cargados",
      value: layouts.length,
      icon: Boxes,
      tone: "cyan",
    },
    {
      label: "Resultado actual",
      value: filteredLayouts.length,
      icon: Radar,
      tone: "steel",
    },
    {
      label: "Estado del repositorio",
      value: isLoading ? "Sync" : "Ready",
      icon: ShieldCheck,
      tone: "amber",
    },
  ];

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${
        isDark ? "bg-[#070d14]" : "bg-[#eef2f4]"
      }`}
    >
      <Sidebar />

      <main
        className={`flex-1 overflow-y-auto ${
          isDark ? "bg-[#070d14]" : "bg-[#eef2f4]"
        }`}
      >
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div
            className={`overflow-hidden rounded-[30px] ${
              isDark
                ? "border border-[#162433] bg-[linear-gradient(180deg,#0a1119_0%,#0d151e_44%,#101a24_100%)] shadow-[0_34px_92px_-54px_rgba(0,0,0,0.68)]"
                : "border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-[0_28px_68px_-44px_rgba(31,41,55,0.16)]"
            }`}
          >
            <section
              className={`relative overflow-hidden px-6 py-7 md:px-8 md:py-8 ${
                isDark ? "border-b border-[#162433]" : "border-b border-[#dde4e8]"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  isDark
                    ? "opacity-[0.16] [background-image:linear-gradient(rgba(124,215,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(124,215,255,0.28)_1px,transparent_1px)] [background-size:28px_28px]"
                    : "opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.16)_1px,transparent_1px)] [background-size:28px_28px]"
                }`}
              />
              <div
                className={`absolute inset-x-0 top-0 h-px ${
                  isDark
                    ? "bg-[linear-gradient(90deg,transparent,rgba(124,215,255,0.48),transparent)]"
                    : "bg-[linear-gradient(90deg,transparent,rgba(37,95,130,0.22),transparent)]"
                }`}
              />
              <div
                className={`absolute left-0 top-0 h-full w-[38%] ${
                  isDark
                    ? "bg-[linear-gradient(90deg,rgba(124,215,255,0.06),transparent)]"
                    : "bg-[linear-gradient(90deg,rgba(121,200,241,0.08),transparent)]"
                }`}
              />

              <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-4xl">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isDark
                        ? "border border-[#21415f] bg-[#0d1d2a] text-[#89dfff]"
                        : "border border-[#d6e2ea] bg-white text-[#5f7487]"
                    }`}
                  >
                    <Radar className="h-3.5 w-3.5" />
                    SCADA layout control
                  </div>

                  <h1
                    className={`mt-6 max-w-5xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-6xl ${
                      isDark ? "text-white" : "text-[#2f3942]"
                    }`}
                  >
                    Consola tecnica
                    <br />
                    <span className={isDark ? "text-[#89dfff]" : "text-[#255f82]"}>
                      para despliegue y supervision de layouts.
                    </span>
                  </h1>

                  <p
                    className={`mt-5 max-w-3xl text-sm leading-7 md:text-base ${
                      isDark ? "text-[#98a9bb]" : "text-[#667380]"
                    }`}
                  >
                    Un enfoque mas SCADA: contraste controlado, lectura operativa
                    y acceso directo a cada pantalla desde un entorno que parece
                    herramienta tecnica real, no galeria de contenido.
                  </p>
                </div>

                <aside className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {statusCards.map((item) => {
                    const Icon = item.icon;
                    const tones = isDark
                      ? {
                          cyan: "border-[#21415f] bg-[linear-gradient(145deg,#0f2232_0%,#133149_100%)] text-[#89dfff]",
                          steel:
                            "border-[#2d3b49] bg-[linear-gradient(145deg,#121a22_0%,#1a2632_100%)] text-[#d4dde7]",
                          amber:
                            "border-[#4b4328] bg-[linear-gradient(145deg,#221e11_0%,#2d2717_100%)] text-[#f1cf80]",
                        }
                      : {
                          cyan: "border-[#d6e2ea] bg-white text-[#255f82]",
                          steel: "border-[#dce3e8] bg-white text-[#49566f]",
                          amber: "border-[#ece3c6] bg-white text-[#8f6a18]",
                        };

                    return (
                      <article
                        key={item.label}
                        className={`rounded-[22px] border px-4 py-4 ${tones[item.tone]}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                            {item.label}
                          </p>
                          <Icon className="h-4.5 w-4.5 opacity-90" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </aside>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                <div className="relative w-full max-w-xl">
                  <Search
                    className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      isDark ? "text-[#7f95ab]" : "text-[#8f919a]"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar layouts por nombre..."
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
                  Drag desde cabecera tecnica
                </div>
              </div>

              {isLoading && (
                <div
                  className={`rounded-[24px] px-5 py-4 text-sm ${
                    isDark
                      ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
                      : "border border-[#dce3e8] bg-white text-[#8f919a]"
                  }`}
                >
                  Cargando layouts...
                </div>
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
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {filteredLayouts.map((layout) => (
                        <SortableItem
                          key={layout.id}
                          layout={layout}
                          onDelete={handleDelete}
                          navigate={navigate}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {!isLoading &&
                layouts.length > 0 &&
                filteredLayouts.length === 0 && (
                  <div
                    className={`rounded-[24px] px-6 py-8 text-center ${
                      isDark
                        ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
                        : "border border-[#dce3e8] bg-white text-[#8f919a]"
                    }`}
                  >
                    No se encontraron layouts con el nombre "{searchTerm}".
                  </div>
                )}

              {!isLoading && layouts.length === 0 && (
                <div
                  className={`rounded-[24px] px-6 py-8 text-center ${
                    isDark
                      ? "border border-[#2d3b49] bg-[#111922] text-[#a5b7ca]"
                      : "border border-[#dce3e8] bg-white text-[#8f919a]"
                  }`}
                >
                  Aun no tienes layouts creados.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SortableItem({ layout, onDelete, navigate, isDark }) {
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
            Modulo SCADA
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
            Operativo
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className={`relative h-56 overflow-hidden border-b lg:h-auto lg:border-b-0 lg:border-r ${
            isDark ? "border-[#21415f] bg-[#09131c]" : "border-[#eef1f5] bg-[#f3f6fb]"
          }`}
        >
          <iframe
            src={`/layout/${layout.id}`}
            title={layout.name}
            frameBorder="0"
            scrolling="yes"
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{
              width: "166.66%",
              height: "166.66%",
              transform: "scale(0.6)",
            }}
          />
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
              {layout.name}
            </h3>

            <p
              className={`mt-4 text-sm leading-7 ${
                isDark ? "text-[#a7b9c9]" : "text-[#6b7681]"
              }`}
            >
              Entorno de visualizacion tecnica para seguimiento de proceso,
              navegacion entre vistas y acceso a la capa operativa del layout.
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
                  Modo
                </p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    isDark ? "text-white" : "text-[#2f3440]"
                  }`}
                >
                  Produccion
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
                  Criticidad
                </p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    isDark ? "text-[#f1cf80]" : "text-[#6d5113]"
                  }`}
                >
                  Supervisada
                </p>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 flex items-center justify-between border-t pt-5 ${
              isDark ? "border-[#21415f]" : "border-[#eef1f5]"
            }`}
          >
            <FavoriteHeart type="mylayout" objectId={layout.id} />

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/layout/${layout.id}`);
                }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  isDark
                    ? "bg-[#7cd7ff] text-[#0d2337] hover:bg-[#95e0ff]"
                    : "bg-[#194b68] text-white hover:bg-[#215f82]"
                }`}
              >
                Abrir vista
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(layout.id, layout.name);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                  isDark
                    ? "border-[#5e3340] bg-[#2b1820] text-[#ff90ab] hover:bg-[#321c25]"
                    : "border-[#f1d7dc] bg-[#fff8f9] text-[#cf4b68] hover:bg-[#fff1f3]"
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
