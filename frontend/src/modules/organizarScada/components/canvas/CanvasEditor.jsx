// src/modules/organizarScada/components/canvas/CanvasEditor.jsx
import React, { useRef } from "react";
import DraggableBox from "./DraggableBox";

const CanvasEditor = ({
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  canvasWidth  = "1180px",
  canvasHeight = "710px",
  zoom = 1,
  onStageSize,
  isLiveMode = false,   // ← NUEVO: activa el modo tiempo real en todos los widgets
}) => {
  const canvasRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(e, canvasRef.current);
  };

  return (
    <div
      className="relative flex-1 overflow-auto bg-slate-100"
      style={{ cursor: isLiveMode ? "default" : undefined }}
    >
      <div className="flex h-full items-center justify-center">
        <div
          ref={canvasRef}
          onDrop={!isLiveMode ? handleDrop : undefined}
          onDragOver={!isLiveMode ? (e) => e.preventDefault() : undefined}
          className="relative m-8 rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-300"
          style={{
            width:    canvasWidth,
            height:   canvasHeight,
            minWidth: 640,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            backgroundImage: isLiveMode
              ? "none"
              : "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          {elements.map((el) => {
            const isVisible = el?.data?.settings?.is_visible !== false;
            if (!isVisible && !isLiveMode) return null; // oculto en editor
            if (!isVisible && isLiveMode) return null;  // oculto también en live

            return (
              <DraggableBox
                key={el.id}
                id={el.id}
                initialX={el.x}
                initialY={el.y}
                initialWidth={el.data?.width  || 200}
                initialHeight={el.data?.height || 180}
                data={el.data}
                isSelected={selectedId === el.id}
                isLiveMode={isLiveMode}
                onSelect={() => !isLiveMode && onSelect?.(el.id)}
                onDragStop={(id, x, y) => onUpdate?.(id, { x, y })}
                onResizeStop={(id, w, h, x, y) =>
                  onUpdate?.(id, { x, y, data: { ...el.data, width: w, height: h } })
                }
                onDelete={onDelete}
              />
            );
          })}

          {elements.length === 0 && !isLiveMode && (
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
