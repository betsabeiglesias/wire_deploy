import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChartColumnBig,
  GripVertical,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "../../sidebar/Sidebar";
import PbiModal from "../components/PbiModal";
import FavoriteHeart from "../../../components/FavoriteHeart";

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

const PowerBiAll = () => {
  const {
    powerBis: storePowerBis,
    fetchPowerBis,
    deletePowerBi,
    updatePowerBiOrder,
    isLoading,
  } = usePowerBiStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [powerBis, setPowerBis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPbiData, setCurrentPbiData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPowerBis();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setPowerBis(storePowerBis);
  }, [storePowerBis]);

  const filteredPowerBis = useMemo(() => {
    return powerBis.filter((pbi) =>
      pbi.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [powerBis, searchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = powerBis.findIndex((pbi) => pbi.id === active.id);
    const newIndex = powerBis.findIndex((pbi) => pbi.id === over.id);
    const reordered = arrayMove(powerBis, oldIndex, newIndex);

    setPowerBis(reordered);

    try {
      await updatePowerBiOrder(reordered);
    } catch (err) {
      setPowerBis(storePowerBis);
      alert("Error al guardar el orden");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Eliminar "${name}"?`)) return;

    try {
      await deletePowerBi(id);
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f8]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]">
            <section className="relative overflow-hidden border-b border-[#ececee] px-6 py-7 md:px-8 md:py-8">
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]" />
              <div className="absolute right-[-40px] top-[-40px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.18),transparent_72%)]" />

              <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                <div className="max-w-3xl">
                  <h1 className="mt-5 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#464851] md:text-6xl">
                    Galeria de
                    <br />
                    <span className="text-[#79c8f1]">dashboards analiticos.</span>
                  </h1>
                </div>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                <div className="relative w-full max-w-xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f919a]" />
                  <input
                    type="text"
                    placeholder="Buscar Power BI por nombre..."
                    className="w-full rounded-2xl border border-[#d9e0e5] bg-white px-4 py-3 pl-11 text-sm text-[#2f3942] outline-none shadow-[0_18px_30px_-28px_rgba(31,41,55,0.16)] transition focus:border-[#79c8f1]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPbiData(null);
                    setIsEditMode(false);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#194b68] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_30px_-18px_rgba(25,75,104,0.45)] transition hover:bg-[#215f82]"
                >
                  <Plus className="h-4 w-4" />
                  Nueva vista
                </button>
              </div>

              {isLoading && (
                <div className="rounded-[24px] border border-[#ececee] bg-white px-5 py-4 text-sm text-[#8f919a]">
                  Cargando vistas...
                </div>
              )}

              {!isLoading && filteredPowerBis.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredPowerBis.map((pbi) => pbi.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                      {filteredPowerBis.map((pbi) => (
                        <SortablePbiCard
                          key={pbi.id}
                          pbi={pbi}
                          onDelete={handleDelete}
                          onEdit={(item) => {
                            setCurrentPbiData(item);
                            setIsEditMode(true);
                            setShowModal(true);
                          }}
                          onView={(item) =>
                            navigate("/powerbi-view", {
                              state: { infoPowerBi: item },
                            })
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {!isLoading &&
                powerBis.length > 0 &&
                filteredPowerBis.length === 0 && (
                  <div className="rounded-[24px] border border-[#ececee] bg-white px-6 py-8 text-center text-[#8f919a]">
                    No se encontraron vistas con el nombre "{searchTerm}".
                  </div>
                )}

              {!isLoading && powerBis.length === 0 && (
                <div className="rounded-[24px] border border-[#ececee] bg-white px-6 py-8 text-center text-[#8f919a]">
                  Aun no tienes vistas.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <PbiModal
        showModal={showModal}
        setShowModal={setShowModal}
        initialData={currentPbiData}
        isEditMode={isEditMode}
      />
    </div>
  );
};

function SortablePbiCard({ pbi, onDelete, onEdit, onView }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pbi.id });

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
      className={`group overflow-hidden rounded-[30px] border border-[#e6e8ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] shadow-[0_24px_42px_-28px_rgba(31,41,55,0.18)] transition-all ${
        isDragging
          ? "scale-[1.02] opacity-85 shadow-[0_30px_58px_-26px_rgba(31,41,55,0.24)] ring-2 ring-[#79c8f1]/20"
          : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between border-b border-[#eef1f5] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3 cursor-grab active:cursor-grabbing"
      >
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8f919a]">
          <GripVertical className="h-4 w-4" />
          Reordenar
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dde6f0] bg-[#f6fbff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#255f82]">
          <LayoutGrid className="h-3.5 w-3.5" />
          Dashboard
        </span>
      </div>

      <div className="relative h-64 overflow-hidden border-b border-[#eef1f5] bg-[#f3f6fb]">
        {pbi.embed_url ? (
          <iframe
            src={pbi.embed_url}
            title={pbi.name}
            frameBorder="0"
            className="h-full w-full pointer-events-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#9ea3ad]">
            Sin vista previa
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,255,0.05)_0%,rgba(248,250,255,0)_40%,rgba(255,255,255,0.78)_100%)]" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-[-0.04em] text-[#2f3440]">
              {pbi.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#7f8794]">
              {pbi.description || "Sin descripcion."}
            </p>
          </div>

          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eef5f8] text-[#255f82]">
            <ChartColumnBig className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#eef1f5] bg-[#fbfbfc] px-4 py-4">
        <FavoriteHeart type="mypowerbi" objectId={pbi.id} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(pbi)}
            className="rounded-2xl bg-[#194b68] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#215f82]"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(pbi)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d9e0e5] bg-white text-[#255f82] transition hover:bg-[#f5f9fb]"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(pbi.id, pbi.name)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d7dc] bg-[#fff8f9] text-[#cf4b68] transition hover:bg-[#fff1f3]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default PowerBiAll;
