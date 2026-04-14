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
  layers = [],
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
          // 1. Si no hay imagen o estamos en modo live, no hacemos nada.
          if (!backgroundImage || isLiveMode) return;

          // 2. Si el fondo está bloqueado (opcional, si quieres esa función)
          const bgLayer = (layers || []).find(l => l.data?.settings?.isBackground);
          if (bgLayer?.isLocked) return;

          // 3. Evitamos mover el fondo si clicamos en un widget o botón
          if (e.target.closest('.box-header') || e.target.closest('button')) {
            return;
          }

          // 4. Iniciamos el movimiento
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
            {/* RESIZE HANDLES (8 puntos) */}
            {/* ========================= */}

            {/* LADO DERECHO */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startWidth = bgSize.width;
                const onMove = (ev) => {
                  const delta = (ev.clientX - startX) / effectiveZoom;
                  setBgSize((prev) => ({ ...prev, width: Math.max(50, startWidth + delta) }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", right: -3, top: 0, width: "10px", height: "100%", cursor: "ew-resize", zIndex: 10 }}
            />

            {/* LADO INFERIOR */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startY = e.clientY;
                const startHeight = bgSize.height;
                const onMove = (ev) => {
                  const delta = (ev.clientY - startY) / effectiveZoom;
                  setBgSize((prev) => ({ ...prev, height: Math.max(50, startHeight + delta) }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", bottom: -3, left: 0, width: "100%", height: "10px", cursor: "ns-resize", zIndex: 10 }}
            />

            {/* LADO IZQUIERDO */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startWidth = bgSize.width;
                const initX = bgTransform.x;
                const onMove = (ev) => {
                  const delta = (ev.clientX - startX) / effectiveZoom;
                  setBgSize((prev) => ({ ...prev, width: Math.max(50, startWidth - delta) }));
                  setBgTransform((prev) => ({ ...prev, x: initX + delta }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", left: -3, top: 0, width: "10px", height: "100%", cursor: "ew-resize", zIndex: 10 }}
            />

            {/* LADO SUPERIOR */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startY = e.clientY;
                const startHeight = bgSize.height;
                const initY = bgTransform.y;
                const onMove = (ev) => {
                  const delta = (ev.clientY - startY) / effectiveZoom;
                  setBgSize((prev) => ({ ...prev, height: Math.max(50, startHeight - delta) }));
                  setBgTransform((prev) => ({ ...prev, y: initY + delta }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", top: -3, left: 0, width: "100%", height: "10px", cursor: "ns-resize", zIndex: 10 }}
            />

            {/* ESQUINA INFERIOR DERECHA */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = bgSize.width;
                const startHeight = bgSize.height;
                const onMove = (ev) => {
                  setBgSize({
                    width: Math.max(50, startWidth + (ev.clientX - startX) / effectiveZoom),
                    height: Math.max(50, startHeight + (ev.clientY - startY) / effectiveZoom),
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
                right: -5,
                bottom: -5,
                width: "14px",
                height: "14px",
                cursor: "nwse-resize",
                background: "rgba(59,130,246,0.8)",
                borderRadius: "2px",
                zIndex: 20
              }}
            />
            
            {/* ESQUINA INFERIOR IZQUIERDA */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = bgSize.width;
                const startHeight = bgSize.height;
                const initX = bgTransform.x;
                const onMove = (ev) => {
                  const dx = (ev.clientX - startX) / effectiveZoom;
                  setBgSize({
                    width: Math.max(50, startWidth - dx),
                    height: Math.max(50, startHeight + (ev.clientY - startY) / effectiveZoom),
                  });
                  setBgTransform(prev => ({ ...prev, x: initX + dx }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", left: -5, bottom: -5, width: "14px", height: "14px", cursor: "nesw-resize", background: "rgba(59,130,246,0.8)", zIndex: 20 }}
            />

            {/* ESQUINA SUPERIOR DERECHA */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = bgSize.width;
                const startHeight = bgSize.height;
                const initY = bgTransform.y;
                const onMove = (ev) => {
                  const dy = (ev.clientY - startY) / effectiveZoom;
                  setBgSize({
                    width: Math.max(50, startWidth + (ev.clientX - startX) / effectiveZoom),
                    height: Math.max(50, startHeight - dy),
                  });
                  setBgTransform(prev => ({ ...prev, y: initY + dy }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", right: -5, top: -5, width: "14px", height: "14px", cursor: "nesw-resize", background: "rgba(59,130,246,0.8)", zIndex: 20 }}
            />

            {/* ESQUINA SUPERIOR IZQUIERDA */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = bgSize.width;
                const startHeight = bgSize.height;
                const initX = bgTransform.x;
                const initY = bgTransform.y;
                const onMove = (ev) => {
                  const dx = (ev.clientX - startX) / effectiveZoom;
                  const dy = (ev.clientY - startY) / effectiveZoom;
                  setBgSize({
                    width: Math.max(50, startWidth - dx),
                    height: Math.max(50, startHeight - dy),
                  });
                  setBgTransform(prev => ({ ...prev, x: initX + dx, y: initY + dy }));
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              style={{ position: "absolute", left: -5, top: -5, width: "14px", height: "14px", cursor: "nwse-resize", background: "rgba(59,130,246,0.8)", zIndex: 20 }}
            />
          </div>
        )}

        {/* ELEMENTOS */}
        {elements.map((el) => {
          const isVisible = el?.data?.settings?.is_visible !== false;
          
          // Buscamos si el elemento está bloqueado en el array de capas
          // IMPORTANTE: Asegúrate de que 'layers' llega como prop a este componente
          const layerInfo = (layers || []).find(l => String(l.id) === String(el.id));
          const isLocked = layerInfo?.isLocked === true;

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
              isLocked={isLocked} 
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