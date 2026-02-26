import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../../../components/HomeButton";
import FavoriteHeart from "../../../components/FavoriteHeart";
import { useLayoutStore } from "@/store/useLayoutStore";

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

export default function Layout() {
  const navigate = useNavigate();
  const { layouts: storeLayouts, fetchLayouts, deleteLayout, isLoading } = useLayoutStore();
  const [layouts, setLayouts] = useState([]);

  useEffect(() => {
    fetchLayouts();
  }, []);

  useEffect(() => {
    setLayouts(storeLayouts);
  }, [storeLayouts]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      try {
        await deleteLayout(id);
        setLayouts((prev) => prev.filter((l) => l.id !== id));
      } catch (err) {
        alert("Error al eliminar el layout");
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layouts.findIndex((l) => l.id === active.id);
    const newIndex = layouts.findIndex((l) => l.id === over.id);

    const newLayouts = arrayMove(layouts, oldIndex, newIndex);
    setLayouts(newLayouts);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className="absolute top-8 right-8 z-10">
        <HomeButton />
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mt-10 mb-16 text-gray-800">Mis SCADA</h1>

        {isLoading && <p className="text-gray-500">Cargando layouts...</p>}

        {!isLoading && layouts.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layouts.map((l) => l.id)} strategy={rectSortingStrategy}>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {layouts.map((layout) => (
                  <SortableItem
                    key={layout.id}
                    layout={layout}
                    onDelete={handleDelete}
                    navigate={navigate}
                  />
                ))}
              </section>
            </SortableContext>
          </DndContext>
        )}

        {!isLoading && layouts.length === 0 && (
          <p className="text-gray-400 italic">No tienes layouts creados todavía.</p>
        )}
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
    isDragging 
  } = useSortable({ id: layout.id });

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
      className={`
        bg-white rounded-xl overflow-hidden flex flex-col border transition-shadow duration-300
        ${isDragging 
          ? "shadow-2xl ring-2 ring-green-500/20 scale-105 opacity-90 cursor-grabbing" 
          : "shadow-md border-gray-200"
        }
      `}
    >
      {/* ZONA DE ARRASTRE: Parte Superior (Iframe) + Parte Central (Nombre) */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        
        {/* Parte superior: Iframe con Overlay */}
        <div className="h-64 bg-white overflow-hidden relative border-b pointer-events-none">
          <iframe
            src={`/layout/${layout.id}`}
            title={`preview-${layout.id}`}
            className="absolute top-0 left-0 border-0 origin-top-left"
            style={{
              width: "166.66%",
              height: "166.66%",
              transform: "scale(0.6)",
            }}
          />
          {/* Capa invisible para evitar que el iframe robe el foco del mouse */}
          <div className="absolute inset-0 bg-transparent" />
        </div>

        {/* Parte central: Nombre */}
        <div className="p-5 flex-grow bg-white">
          <h2 className="text-xl font-bold text-gray-800 truncate">{layout.name}</h2>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-1">
            Click o arrastra para mover
          </p>
        </div>
      </div>

      {/* FRANJA INFERIOR: BOTONES (CLICKABLE) */}
      <div className="flex items-center justify-start gap-3 p-4 border-t bg-gray-50">
        <FavoriteHeart type="mylayout" objectId={layout.id} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/layout/${layout.id}`);
          }}
          className="px-6 py-1.5 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-100 hover:border-green-700 transition-all active:scale-95"
        >
          Ver pantalla completa
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(layout.id, layout.name);
          }}
          className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-all ml-auto"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}