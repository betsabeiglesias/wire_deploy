import React, { useRef, useEffect, useState } from "react";
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
  onStageSize,
  zoom = 1,
  isLiveMode = false,
  layoutId = null,
}) => {

  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;
  const viewportRef = useRef(null);
  const canvasRef   = useRef(null);

  const realtime  = useRealtime();
  const tagsMap   = realtime?.tagsMap || new Map();
  const { tags: projectTags } = useProjectTags(isLiveMode ? layoutId : null, tagsMap);


  useEffect(() => {
      onStageSize?.({
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
      });
    }, []);

  const [autoZoom, setAutoZoom] = useState(1);


  useEffect(() => {
  const updateZoom = () => {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();

    const scaleX = rect.width / BASE_WIDTH;
    const scaleY = rect.height / BASE_HEIGHT;

    const fitZoom = Math.min(scaleX, scaleY);

    setAutoZoom(fitZoom);
  };

  updateZoom();

  const observer = new ResizeObserver(updateZoom);
    if (viewportRef.current) observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);

  const effectiveZoom = zoom * autoZoom;


  

  const handleDrop = (e) => {
  e.preventDefault();

  const rect = canvasRef.current.getBoundingClientRect();

      const x = (e.clientX - rect.left) / effectiveZoom;
      const y = (e.clientY - rect.top) / effectiveZoom;

      onDrop?.({ x, y }, canvasRef.current);
    };


  return (
    <div
        ref={viewportRef}
        className="absolute inset-0 overflow-auto bg-slate-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
       {/* CENTRADO REAL */}
      {/* <div className="w-full h-full flex relative"> */}

        {/* 🔥 WRAPPER CON TAMAÑO REAL ESCALADO */}
        <div
          style={{
            width: BASE_WIDTH * effectiveZoom,
            height: BASE_HEIGHT * effectiveZoom,
            position: "relative",
             margin: "0 auto",
          }}
        >
      
        <div
            ref={canvasRef}
            onDrop={!isLiveMode ? handleDrop : undefined}
            onDragOver={!isLiveMode ? (e) => e.preventDefault() : undefined}
            className="absolute top-0 left-0 rounded-xl border border-slate-300 bg-white shadow-sm"
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              transform: `scale(${effectiveZoom})`,
              transformOrigin: "top left",
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
                  initialWidth={el.data?.width || 200}
                  initialHeight={el.data?.height || 180}
                  data={el.data}
                  isSelected={selectedId === el.id}
                  isLiveMode={isLiveMode}
                  onSelect={() => !isLiveMode && onSelect?.(el.id)}
                  onDragStop={(id, x, y) => onUpdate?.(id, { x, y })}
                  onResizeStop={(id, w, h, x, y) =>
                    onUpdate?.(id, {
                      x,
                      y,
                      data: { ...el.data, width: w, height: h },
                    })
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
      </div>
  );
};

export default CanvasEditor;