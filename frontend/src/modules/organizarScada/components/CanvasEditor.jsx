//CanvasEditor
// ScadaCanvasWrapper.jsx
import React, { useRef } from "react";
import DraggableBox from "@/modules/organizarScada/components/DraggableBox";

/**
 * Lienzo reutilizable con fondo cuadriculado, soporte de drop y elementos Rnd.
 * Props:
 * - elements: array de elementos (deben contener id, x, y, data con width/height)
 * - selectedId: id seleccionado (opcional)
 * - onSelect(id)
 * - onUpdate(id, changes) // cambios de Rnd (x, y, data.width, data.height)
 * - onDelete(id)
 * - onDrop(event) // opcional, para arrastrar desde sidebar (dataTransfer)
 */
const CanvasEditor = ({
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  canvasWidth = "80vw",
  canvasHeight = "80vh",
}) => {
  const canvasRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(e, canvasRef.current);
  };

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative flex-1 overflow-auto bg-slate-100"
    >
      <div className="flex h-full items-center justify-center">
        <div
          className="relative m-8 rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-300"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            minWidth: 640,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          {elements.map((el) => (
            <DraggableBox
              key={el.id}
              id={el.id}
              initialX={el.x}
              initialY={el.y}
              initialWidth={el.data?.width || 200}
              initialHeight={el.data?.height || 180}
              data={el.data}
              onSelect={() => onSelect?.(el.id)}
              onDragStop={(id, x, y) => onUpdate?.(id, { x, y })}
              onResizeStop={(id, w, h, x, y) =>
                onUpdate?.(id, {
                  x,
                  y,
                  data: { ...el.data, width: w, height: h },
                })
              }
              onDelete={onDelete}
            />
          ))}

          {elements.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs text-slate-400">
              Arrastra elementos al lienzo para empezar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;