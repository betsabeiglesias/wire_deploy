// src/modules/organizarScada/components/canvas/CanvasEditor.jsx
import React, { useRef } from "react";
import DraggableBox from "./DraggableBox";
import { useProjectTags } from "@/modules/organizarScada/hooks/useProjectTags";
import { useRealtime } from "@/context/RealtimeProvider";

const CanvasEditor = ({
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  canvasWidth  = "100%",
  canvasHeight = "100%",
  zoom = 1,
  onStageSize,
  isLiveMode = false,
  layoutId = null,
}) => {
  const canvasRef = useRef(null);
  const realtime  = useRealtime();
  const tagsMap   = realtime?.tagsMap || new Map();
  const { tags: projectTags } = useProjectTags(isLiveMode ? layoutId : null, tagsMap);

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(e, canvasRef.current);
  };

  return (
    <div
      className="absolute inset-0 overflow-auto bg-slate-100"
      style={{ cursor: isLiveMode ? "default" : undefined }}
    >

    {/* // Viewport = scrollable, ocupa todo el espacio disponible */}
    <div className="absolute inset-0 overflow-auto bg-slate-100"
     style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "20px 20px" }}>

    {/* STAGE */}
      {/* <div className="absolute inset-0"> */}
        <div
          ref={canvasRef}
          onDrop={!isLiveMode ? handleDrop : undefined}
          onDragOver={!isLiveMode ? (e) => e.preventDefault() : undefined}
          className="relative rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-300"
          style={{
            width:    canvasWidth || "100%",
            height:   canvasHeight|| "100%",
            minWidth: "100%",
            minHeight: "100%",
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
            if (!isVisible) return null;

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
                projectTags={projectTags}
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
    // </div>
  );
};

export default CanvasEditor;