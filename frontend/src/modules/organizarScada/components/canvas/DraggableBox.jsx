import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import useLiveTag from "@/modules/organizarScada/hooks/useLiveTag";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import "@/styles/gateway.css";

// ==================== DRAGGABLE BOX COMPONENT ====================

export default function DraggableBox({
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  data,
  id,
  theme = "theme-clean",
  onSelect,
  onDrag,
  onDragStop,
  onResize,
  onResizeStop,
  onDelete,
  isSelected = false,
  isReadOnly = false,
}) {
  if (!data) return null;

  // Estado local para Rnd, importado de la rama develop
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  // Sincronizar el estado interno con las props iniciales
  useEffect(() => {
    setX(initialX);
    setY(initialY);
    setWidth(initialWidth);
    setHeight(initialHeight);
  }, [initialX, initialY, initialWidth, initialHeight]);

  const handleDragStop = (_e, d) => {
    setX(d.x);
    setY(d.y);
    onDragStop(id, d.x, d.y);
  };

  const handleResizeStop = (_e, _dir, ref, _delta, pos) => {
    const newW = parseInt(ref.style.width, 10);
    const newH = parseInt(ref.style.height, 10);
    setWidth(newW);
    setHeight(newH);
    setX(pos.x);
    setY(pos.y);
    onResizeStop(id, newW, newH, pos.x, pos.y);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const showFrame = data?.settings?.showFrame ?? false;

  const { live, valueHistory } = useLiveTag(data);

  const renderContent = () => renderWidget({ data, live, width, height, theme, valueHistory });

  // Contenido del widget (unificado desde la rama develop)
  const WidgetContent = (
    <div className="relative flex flex-col h-full w-full">
      {!isReadOnly && isSelected && (
        <button
          onClick={handleDelete}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:bg-red-100 hover:text-red-600 text-lg font-bold"
          aria-label="Eliminar componente"
          title="Eliminar"
        >
          &times;
        </button>
      )}
      {/* Contenido principal del componente */}
      <div className="flex-grow p-2 overflow-hidden flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );

  // Renderizado en modo solo lectura (fijo, sin Rnd)
  if (isReadOnly) {
    return (
      <div
        className={`${showFrame ? "bg-white rounded-lg shadow-lg border border-gray-200" : "bg-transparent"} absolute`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          // Usamos el estado local x, y para la posición
          transform: `translate(${x}px, ${y}px)`,
          pointerEvents: "none",
        }}
      >
        {WidgetContent}
      </div>
    );
  }

  // Renderizado en modo editable (con Rnd)
  return (
    <Rnd
      className={`${showFrame ? "bg-white rounded-lg shadow-lg border border-gray-200" : "bg-transparent"} node cursor-pointer`}
      data-node-id={id}
      // Usamos el estado local para size y position
      size={{ width: width, height: height }}
      position={{ x: x, y: y }}
      onDrag={(e, d) => onDrag?.(id, e, d)}
      onDragStop={handleDragStop}
      onResize={(e, dir, ref, delta, pos) => onResize?.(id, e, dir, ref, delta, pos)}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={
        data.type === "speedometer" || data.type === "temperature-gauge"
          ? 120
          : 50
      }
      minHeight={
        data.type === "speedometer" || data.type === "temperature-gauge"
          ? 150
          : 50
      }
      dragHandleClassName={showFrame ? "box-header" : undefined}
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}
      onClick={() => onSelect?.()}
    >
      {WidgetContent}
    </Rnd>
  );
}
