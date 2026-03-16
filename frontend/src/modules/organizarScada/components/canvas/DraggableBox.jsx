// src/modules/organizarScada/components/canvas/DraggableBox.jsx
//
// Widget draggable del canvas SCADA.
// - En modo EDICIÓN (isLiveMode=false): live.value = undefined, muestra valor inicial
// - En modo LIVE (isLiveMode=true): lee allTags del RealtimeProvider (UNA sola conexión WS)
//   No abre ninguna conexión propia — usa useRealtime() del context.
//
import React, { useContext, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import useLiveTag from "@/modules/organizarScada/hooks/useLiveTag";
import { useRealtime } from "@/context/RealtimeProvider";

export default function DraggableBox({
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  data,
  id,
  theme = "theme-clean",
  isSelected = false,
  isLiveMode = false,
  onSelect,
  onDragStop,
  onResizeStop,
  onDelete,
  isReadOnly = false,
}) {
  if (!data) return null;

  const [pos,  setPos]  = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });

  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    setSize({ w: initialWidth, h: initialHeight });
  }, [initialX, initialY, initialWidth, initialHeight]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  // useRealtime() siempre se llama (regla de hooks) pero solo usamos allTags en modo live.
  // Si no hay RealtimeProvider en el árbol, useRealtime devuelve null → fallback a [].
  const realtimeCtx = useRealtime();
  const allTags     = isLiveMode ? (realtimeCtx?.allTags || []) : [];

  const settings = data.settings || {};
const { live, valueHistory } = useLiveTag(isLiveMode ? data : null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDragStop = (_e, d) => {
    setPos({ x: d.x, y: d.y });
    onDragStop?.(id, d.x, d.y);
  };

  const handleResizeStop = (_e, _dir, ref, _delta, p) => {
    const w = parseInt(ref.style.width,  10);
    const h = parseInt(ref.style.height, 10);
    setSize({ w, h });
    setPos({ x: p.x, y: p.y });
    onResizeStop?.(id, w, h, p.x, p.y);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const equipmentName = live.equipment || settings.equipment || data.equipment || "Sin equipo";
  const hasLiveValue  = typeof live.value !== "undefined";

  const widgetNode = renderWidget({
    data,
    live,
    width:        size.w,
    height:       size.h,
    theme,
    valueHistory,
    demoNow:      Date.now(),
  });

  const content = (
    <div className="relative flex flex-col h-full w-full">
      {/* Header — solo en modo edición */}
      {!isReadOnly && !isLiveMode && (
        <div className="box-header flex justify-between items-center px-2 py-1 border-b border-gray-200 cursor-grab active:cursor-grabbing">
          <span className="font-semibold text-xs text-gray-700 truncate">
            {settings.attributeLabel || data.label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
            className="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 text-base font-bold shrink-0"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      )}

      {/* Widget content */}
      <div className="flex-grow overflow-hidden flex items-center justify-center p-1">
        {widgetNode}
      </div>

      {/* Badges — solo en modo edición */}
      {!isLiveMode && (
        <>
          <div className="component-equipment-label">
            {equipmentName}
          </div>
          {!hasLiveValue && (
            <div className="component-no-data-badge">Sin datos</div>
          )}
        </>
      )}

      {/* Indicador live — solo en modo live */}
      {isLiveMode && hasLiveValue && (
        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Datos en tiempo real" />
      )}
      {isLiveMode && !hasLiveValue && (
        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-slate-300" title="Sin datos" />
      )}
    </div>
  );

  // Modo read-only (viewer) — posición fija sin Rnd
  if (isReadOnly || isLiveMode) {
    return (
      <div
        className={[
          "bg-white rounded-lg shadow border absolute transition-shadow",
          isSelected ? "border-sky-400 shadow-sky-100" : "border-gray-200",
        ].join(" ")}
        style={{
          width:     `${size.w}px`,
          height:    `${size.h}px`,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          pointerEvents: isLiveMode ? "none" : "auto",
        }}
        onClick={() => !isLiveMode && onSelect?.()}
      >
        {content}
      </div>
    );
  }

  // Modo edición — arrastrable con Rnd
  return (
    <Rnd
      className={[
        "bg-white rounded-lg shadow border cursor-pointer",
        isSelected ? "border-sky-400 shadow-sky-100 shadow-md" : "border-gray-200",
      ].join(" ")}
      size={{ width: size.w, height: size.h }}
      position={{ x: pos.x, y: pos.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      dragHandleClassName="box-header"
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}
      onClick={() => onSelect?.()}
    >
      {content}
    </Rnd>
  );
}
