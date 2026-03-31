import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Rnd } from "react-rnd";
import WidgetLiveWrapper from "./WidgetLiveWrapper";

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
  projectTags = [],
}) {
  if (!data) return null;

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });

  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    setSize({ w: initialWidth, h: initialHeight });
  }, [initialX, initialY, initialWidth, initialHeight]);

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

  if (isReadOnly) {
    return (
      <div
        className={[
          "absolute cursor-pointer transition-shadow",
          isSelected ? "rounded-md ring-2 ring-sky-400 ring-offset-2 ring-offset-white" : "",
        ].join(" ")}
        style={{
          width: `${size.w}px`,
          height: `${size.h}px`,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
        onClick={() => onSelect?.()}
      >
        <div className="h-full w-full" style={{ pointerEvents: "none" }}>
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

  return (
    <Rnd
      className={[
        "group",
        isSelected ? "rounded-md ring-2 ring-sky-400 ring-offset-2 ring-offset-white" : "",
      ].join(" ")}
      size={{ width: size.w, height: size.h }}
      position={{ x: pos.x, y: pos.y }}
      onDragStop={(_e, d) => {
        setPos({ x: d.x, y: d.y });
        onDragStop?.(id, d.x, d.y);
      }}
      onResizeStop={(_e, _dir, ref, _delta, p) => {
        const w = parseInt(ref.style.width, 10);
        const h = parseInt(ref.style.height, 10);
        setSize({ w, h });
        setPos({ x: p.x, y: p.y });
        onResizeStop?.(id, w, h, p.x, p.y);
      }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      cancel=".widget-content"
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}
      onClick={() => onSelect?.()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        className={[
          "absolute -top-2 right-5 z-20 h-6 w-6 items-center justify-center rounded-full",
          "border border-slate-200 bg-white text-slate-500 shadow-sm transition",
          "hover:bg-slate-50 hover:text-sky-600",
          isSelected ? "flex" : "hidden group-hover:flex",
        ].join(" ")}
        aria-label="Abrir propiedades"
      >
        <Settings size={14} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(id);
        }}
        className={[
          "absolute -right-2 -top-2 z-20 h-6 w-6 items-center justify-center rounded-full",
          "border border-red-200 bg-white text-sm font-bold text-red-500 shadow-sm transition",
          "hover:bg-red-50 hover:text-red-600",
          isSelected ? "flex" : "hidden group-hover:flex",
        ].join(" ")}
        aria-label="Eliminar"
      >
        x
      </button>

      <div className="widget-content h-full w-full" style={{ pointerEvents: "none" }}>
        <WidgetLiveWrapper
          data={data}
          width={size.w}
          height={size.h}
          theme={theme}
          isLiveMode={false}
        />
      </div>
    </Rnd>
  );
}
