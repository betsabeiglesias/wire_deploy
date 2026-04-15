// src/modules/organizarScada/components/canvas/DraggableBox.jsx
import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import WidgetLiveWrapper from "./WidgetLiveWrapper";


export default function DraggableBox({
  initialX, initialY, initialWidth, initialHeight,
  data, id, theme = "theme-clean",
  isSelected = false, isLiveMode = false,
  onSelect, onDoubleClick, onDragStop, onResizeStop, onDelete,
  isReadOnly = false,
  projectTags = [],
  scale = 1,
}) {
  if (!data) return null;
  if (data.type === "image-widget" && data.settings?.isBackground) {
  return null;
  }

  const [pos,  setPos]  = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });

  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    setSize({ w: initialWidth, h: initialHeight });
  }, [initialX, initialY, initialWidth, initialHeight]);

  const settings = data.settings || {};

  // ── MODO LIVE — completamente pasivo, sin Rnd, sin interacción ─────────────
  if (isLiveMode) {
    return (
      <div
        style={{
          position:  "absolute",
          width:     `${size.w}px`,
          height:    `${size.h}px`,
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

  // ── MODO READ-ONLY — posición fija, seleccionable pero no arrastrable ──────
  if (isReadOnly) {
    return (
      <div
        className={[
          "bg-white rounded-lg shadow border absolute transition-shadow cursor-pointer",
          isSelected ? "border-sky-400 shadow-sky-100" : "border-gray-200",
        ].join(" ")}
        style={{
          width:     `${size.w}px`,
          height:    `${size.h}px`,
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

  // ── MODO EDICIÓN — arrastrable con Rnd ─────────────────────────────────────
  // cancel=".widget-content" hace que Rnd ignore eventos dentro del widget,
  // permitiendo que onClick del Rnd funcione limpiamente sin overlays.
  return (
    <Rnd
      // 🔒 CONTROL DE BLOQUEO
      disableDragging={settings.is_locked === true}
      enableResizing={settings.is_locked !== true}

      onMouseDown={(e) => {
        e.stopPropagation();

        // 🛑 SI ESTÁ BLOQUEADO → cancelar interacción
        if (settings.is_locked === true) {
          e.preventDefault();
          return;
        }
      }}

      className={[
        "bg-white rounded-lg shadow border flex flex-col",
        isSelected ? "border-sky-400 shadow-sky-100 shadow-md" : "border-gray-200",
      ].join(" ")}

      size={{ width: size.w, height: size.h }}
      position={{ x: pos.x, y: pos.y }}

      onDragStop={(_e, d) => {
        if (settings.is_locked === true) return; // 🔒 extra seguridad
        setPos({ x: d.x, y: d.y });
        onDragStop?.(id, d.x, d.y);
      }}

      onResizeStop={(_e, _dir, ref, _delta, p) => {
        if (settings.is_locked === true) return; // 🔒 extra seguridad

        const w = parseInt(ref.style.width, 10);
        const h = parseInt(ref.style.height, 10);

        setSize({ w, h });
        setPos({ x: p.x, y: p.y });

        onResizeStop?.(id, w, h, p.x, p.y);
      }}

      bounds="parent"
      minWidth={50}
      minHeight={50}
      scale={scale}

      dragHandleClassName="box-header"
      cancel=".widget-content"
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}

      onClick={() => onSelect?.()}
      onDoubleClick={() => onDoubleClick?.()}
    >
      {/* Header — drag handle + label + delete */}
      <div className="box-header flex justify-between items-center px-2 py-1 border-b border-gray-200 cursor-grab active:cursor-grabbing">
        <span className="font-semibold text-xs text-gray-700 truncate">
          {settings.attributeLabel || settings.equipment || data.label || "Widget"}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
          className="
            flex items-center justify-center
            w-8 h-8
            -mr-1
            rounded-full
            text-gray-400
            hover:bg-red-100 hover:text-red-600
            text-lg font-bold
            shrink-0
            transition-all duration-150
            hover:scale-125
          "
          aria-label="Eliminar"
        >
          ×
        </button>
      </div>

      {/* Widget — pointer-events none para que los clicks suban al Rnd */}
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
        />
      </div>

      {/* Badge equipo */}
      <div className="component-equipment-label">
        {settings.tagId
          ? settings.tagId.split(":")[1] || settings.tagId
          : settings.equipment || data.label || "Sin binding"}
      </div>
    </Rnd>
  );
}