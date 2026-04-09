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
  const [backgroundImage, setBackgroundImage] = useState(null);

  const [bgTransform, setBgTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });


  const [bgSize, setBgSize] = useState({
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    });


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

  useEffect(() => {
    const bgWidget = elements.find(
      (el) =>
        el?.data?.type === "image-widget" &&
        el?.data?.settings?.isBackground
    );

    if (bgWidget) {
      const settings = bgWidget.data.settings;

      const src =
        settings.imageBase64 ||
        settings.src ||
        settings.url ||
        settings.image ||
        settings.path;

      setBackgroundImage(src || null);

      setBgTransform({
        scale: settings.bgScale || 1,
        x: settings.bgX || 0,
        y: settings.bgY || 0,
      });

    } else {
      setBackgroundImage(null);
    }
  }, [elements]);

  
  

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
        onMouseDown={(e) => {
          if (!backgroundImage || isLiveMode) return;

          const startX = e.clientX;
          const startY = e.clientY;

          const initX = bgTransform.x;
          const initY = bgTransform.y;

          const onMove = (ev) => {
            setBgTransform((prev) => ({
              ...prev,
              x: initX + (ev.clientX - startX),
              y: initY + (ev.clientY - startY),
            }));
          };

          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };

          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
        onWheel={(e) => {
          if (!backgroundImage) return;

          e.preventDefault();

          setBgTransform((prev) => {
            const next = prev.scale + (e.deltaY < 0 ? 0.1 : -0.1);

            return {
              ...prev,
              scale: Math.max(0.5, Math.min(next, 3)),
            };
          });
        }}
        className="absolute top-0 left-0 rounded-xl border border-slate-300 bg-white shadow-sm"
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${effectiveZoom})`,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 🔥 BACKGROUND IMAGE CONTROLLED */}
        {backgroundImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              cursor: "grab",
            }}
          >
            <img
              src={backgroundImage}
              alt="background"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: bgSize.width,
                height: bgSize.height,
                transform: `
                  translate(${bgTransform.x}px, ${bgTransform.y}px)
                  scale(${bgTransform.scale})
                `,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
            />

            {/* ========================= */}
            {/* RESIZE HANDLES (4 lados) */}
            {/* ========================= */}

            {/* RIGHT */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startWidth = bgSize.width;

                const onMove = (ev) => {
                  const delta = ev.clientX - startX;
                  setBgSize((prev) => ({
                    ...prev,
                    width: Math.max(200, startWidth + delta),
                  }));
                };

                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "6px",
                height: "100%",
                cursor: "ew-resize",
              }}
            />

            {/* BOTTOM */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startY = e.clientY;
                const startHeight = bgSize.height;

                const onMove = (ev) => {
                  const delta = ev.clientY - startY;
                  setBgSize((prev) => ({
                    ...prev,
                    height: Math.max(200, startHeight + delta),
                  }));
                };

                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "6px",
                cursor: "ns-resize",
              }}
            />

            {/* BOTTOM-RIGHT CORNER */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = bgSize.width;
                const startHeight = bgSize.height;

                const onMove = (ev) => {
                  const dx = ev.clientX - startX;
                  const dy = ev.clientY - startY;

                  setBgSize({
                    width: Math.max(200, startWidth + dx),
                    height: Math.max(200, startHeight + dy),
                  });
                };

                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "14px",
                height: "14px",
                cursor: "nwse-resize",
                background: "rgba(59,130,246,0.8)",
              }}
            />
          </div>
        )}

        {/* ELEMENTOS */}
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

        {/* EMPTY STATE */}
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