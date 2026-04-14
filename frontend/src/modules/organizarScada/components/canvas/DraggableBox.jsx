// src/modules/organizarScada/components/canvas/DraggableBox.jsx
import React, { useEffect, useState, memo } from "react";
import { Rnd } from "react-rnd";
import WidgetLiveWrapper from "./WidgetLiveWrapper";

// Usamos memo para evitar que el widget se re-renderice si no cambia nada de él
const DraggableBox = memo(({
  initialX, initialY, initialWidth, initialHeight,
  data, id, theme = "theme-clean",
  isSelected = false, isLiveMode = false,
  onSelect, onDragStop, onResizeStop, onDelete,
  isReadOnly = false,
  isLocked = false,
  projectTags = [],
}) => {
  if (!data) return null;
  if (data.type === "image-widget" && data.settings?.isBackground) {
    return null;
  }

  // Mantenemos tus estados locales para los modos estáticos
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });

  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    setSize({ w: initialWidth, h: initialHeight });
  }, [initialX, initialY, initialWidth, initialHeight]);

  const settings = data.settings || {};

  // ── MODO LIVE — completamente pasivo ───────────────────────────────────────
  if (isLiveMode) {
    return (
      <div
        style={{
          position: "absolute",
          width: `${size.w}px`,
          height: `${size.h}px`,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          pointerEvents: "none",
        }}
      >
        <WidgetLiveWrapper
          data={data}
          width={size.w}
          height={size.h}
          theme={theme}
          isLiveMode={true}
          projectTags={projectTags}
        />
      </div>
    );
  }

  // ── MODO READ-ONLY — posición fija ────────────────────────────────────────
  if (isReadOnly) {
    return (
      <div
        className={[
          "bg-white rounded-lg shadow border absolute transition-shadow cursor-pointer",
          isSelected ? "border-sky-400 shadow-sky-100" : "border-gray-200",
        ].join(" ")}
        style={{
          width: `${size.w}px`,
          height: `${size.h}px`,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
        onClick={() => onSelect?.()}
      >
        <div style={{ pointerEvents: "none" }}>
          <WidgetLiveWrapper
            data={data}
            width={size.w}
            height={size.h}
            theme={theme}
            isLiveMode={false}
          />
        </div>
      </div>
    );
  }

  // ── MODO EDICIÓN — con mejoras de rendimiento y candado ────────────────────
  return (
    <Rnd
      className={[
        "bg-white rounded-lg shadow border flex flex-col",
        isSelected ? "border-sky-400 shadow-sky-100 shadow-md" : "border-gray-200",
        isLocked ? "opacity-90" : "",
      ].join(" ")}
      
      // 1. SOLUCIÓN AL LAG: Usamos 'default' para delegar el movimiento a la librería
      // y que no dependa del ciclo de renderizado de React en cada píxel.
      defaultSize={{ width: initialWidth, height: initialHeight }}
      defaultPosition={{ x: initialX, y: initialY }}
      
      // 2. CANDADO: Si está bloqueado, deshabilitamos la interacción
      disableDragging={isLocked}
      enableResizing={!isLocked}
      
      onDragStop={(_e, d) => {
        onDragStop?.(id, d.x, d.y);
      }}
      onResizeStop={(_e, _dir, ref, _delta, p) => {
        const w = parseInt(ref.style.width, 10);
        const h = parseInt(ref.style.height, 10);
        onResizeStop?.(id, w, h, p.x, p.y);
      }}

      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      
      bounds="parent"
      minWidth={50}
      minHeight={50}
      dragHandleClassName="box-header"
      cancel=".widget-content"
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}
      onClick={() => !isLocked && onSelect?.()}
      style={{ 
        zIndex: isSelected ? 999 : 1 
      }}
    >
      {/* Header — drag handle + label + delete */}
      <div 
        className={[
          "box-header flex justify-between items-center px-2 py-1 border-b border-gray-200",
          isLocked ? "cursor-default bg-slate-50" : "cursor-grab active:cursor-grabbing"
        ].join(" ")}
      >
        <div className="flex items-center gap-1 truncate mr-2">
          {isLocked && <span className="text-[10px]">🔒</span>}
          <span className="font-semibold text-[11px] text-gray-700 truncate">
            {settings.attributeLabel || settings.equipment || data.label || "Widget"}
          </span>
        </div>
        
        {!isLocked && (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete?.(id); 
            }}
            className="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 font-bold shrink-0 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Contenido del Widget */}
      <div
        className="widget-content flex-1"
        style={{ pointerEvents: "none", overflow: "hidden" }}
      >
        <WidgetLiveWrapper
          data={data}
          width={size.w}
          height={size.h - 28}
          theme={theme}
          isLiveMode={false}
          projectTags={projectTags}
        />
      </div>

      {/* Badge equipo inferior */}
      <div className="bg-slate-50 border-t border-slate-100 px-2 py-0.5 text-[9px] text-slate-400 truncate rounded-b-lg">
        {settings.tagId || "Sin asignar"}
      </div>
    </Rnd>
  );
}, (prev, next) => {
  // Solo re-renderizar si cambian cosas que afectan visualmente al widget fuera del movimiento
  return (
    prev.isSelected === next.isSelected &&
    prev.isLocked === next.isLocked &&
    prev.isLiveMode === next.isLiveMode &&
    prev.isReadOnly === next.isReadOnly &&
    prev.data === next.data &&
    prev.initialX === next.initialX &&
    prev.initialY === next.initialY
  );
});

export default DraggableBox;