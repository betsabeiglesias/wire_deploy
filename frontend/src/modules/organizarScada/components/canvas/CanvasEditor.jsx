import React, { useEffect, useRef, useState } from "react";
import DraggableBox from "@/modules/organizarScada/components/canvas/DraggableBox";

const CanvasEditor = ({
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDrop,
  canvasWidth = "720px",
  canvasHeight = "500px",
  zoom = 1,
  onStageSize,
}) => {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const guideVRef = useRef(null);
  const guideHRef = useRef(null);
  const prevZoomRef = useRef(zoom);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const SNAP_TOL = 6;
  const parsedCanvasHeight = Number.parseFloat(String(canvasHeight));
  const scaledCanvasHeight = Number.isFinite(parsedCanvasHeight)
    ? parsedCanvasHeight * zoom
    : null;

  const getNodeRect = nodeEl => {
    if (!stageRef.current || !nodeEl) return null;
    const stageRect = stageRef.current.getBoundingClientRect();
    const rect = nodeEl.getBoundingClientRect();
    return {
      left: rect.left - stageRect.left,
      top: rect.top - stageRect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const computeAlignmentGuides = (activeNode, rect) => {
    if (!stageRef.current || !rect) return {};
    const nodes = [...stageRef.current.querySelectorAll(".node")].filter(
      n => n !== activeNode,
    );

    const ax1 = rect.left;
    const ay1 = rect.top;
    const ax2 = rect.left + rect.width;
    const ay2 = rect.top + rect.height;
    const acx = rect.left + rect.width / 2;
    const acy = rect.top + rect.height / 2;

    let bestVX = null;
    let bestHY = null;
    let bestVD = SNAP_TOL + 1;
    let bestHD = SNAP_TOL + 1;

    for (const n of nodes) {
      const r = getNodeRect(n);
      if (!r) continue;
      const bx1 = r.left;
      const by1 = r.top;
      const bx2 = r.left + r.width;
      const by2 = r.top + r.height;
      const bcx = r.left + r.width / 2;
      const bcy = r.top + r.height / 2;

      const vPairs = [
        { a: ax1, b: bx1, guide: bx1 },
        { a: ax1, b: bcx, guide: bcx },
        { a: ax1, b: bx2, guide: bx2 },
        { a: acx, b: bcx, guide: bcx },
        { a: ax2, b: bx2, guide: bx2 },
      ];

      const hPairs = [
        { a: ay1, b: by1, guide: by1 },
        { a: ay1, b: bcy, guide: bcy },
        { a: ay2, b: by2, guide: by2 },
        { a: acy, b: bcy, guide: bcy },
      ];

      vPairs.forEach(p => {
        const d = Math.abs(p.a - p.b);
        if (d <= SNAP_TOL && d < bestVD) {
          bestVD = d;
          bestVX = p.guide;
        }
      });

      hPairs.forEach(p => {
        const d = Math.abs(p.a - p.b);
        if (d <= SNAP_TOL && d < bestHD) {
          bestHD = d;
          bestHY = p.guide;
        }
      });
    }

    return { vGuideX: bestVX, hGuideY: bestHY };
  };

  const renderGuides = align => {
    if (guideVRef.current) {
      if (align.vGuideX != null) {
        guideVRef.current.style.left = `${Math.round(align.vGuideX)}px`;
        guideVRef.current.style.opacity = "1";
      } else {
        guideVRef.current.style.opacity = "0";
      }
    }
    if (guideHRef.current) {
      if (align.hGuideY != null) {
        guideHRef.current.style.top = `${Math.round(align.hGuideY)}px`;
        guideHRef.current.style.opacity = "1";
      } else {
        guideHRef.current.style.opacity = "0";
      }
    }
  };

  const hideGuides = () => {
    if (guideVRef.current) guideVRef.current.style.opacity = "0";
    if (guideHRef.current) guideHRef.current.style.opacity = "0";
  };

  useEffect(() => {
    // Definimos la función fuera del IF para que siempre exista en el scope del efecto
    const updateSize = () => {
      if (stageRef.current && onStageSize) {
        onStageSize({
          width: stageRef.current.offsetWidth,
          height: stageRef.current.offsetHeight,
        });
      }
    };

    // Solo ejecutamos la lógica de suscripción si se cumplen las condiciones
    // pero NO hacemos un return prematuro del Hook completo.
    let observer = null;

    if (
      stageRef.current &&
      onStageSize &&
      typeof ResizeObserver !== "undefined"
    ) {
      updateSize();
      observer = new ResizeObserver(updateSize);
      observer.observe(stageRef.current);
    }

    // La función de limpieza siempre debe devolverse de la misma manera
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [onStageSize, zoom]); // Los hooks siempre terminan aquí

  const handleDrop = e => {
    e.preventDefault();
    const size = stageRef.current
      ? {
          width: stageRef.current.offsetWidth,
          height: stageRef.current.offsetHeight,
        }
      : undefined;
    onDrop?.(e, stageRef.current || canvasRef.current, zoom, size);
  };

  const handlePanMouseDown = e => {
    if (e.button !== 0) return;
    // No iniciar pan cuando se arrastra/interactúa sobre un widget.
    if (e.target.closest(".node")) return;
    if (!canvasRef.current) return;

    isPanningRef.current = true;
    setIsPanning(true);
    lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = e => {
      if (!isPanningRef.current || !canvasRef.current) return;
      const dx = e.clientX - lastPanPointRef.current.x;
      const dy = e.clientY - lastPanPointRef.current.y;
      canvasRef.current.scrollLeft -= dx;
      canvasRef.current.scrollTop -= dy;
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    };

    const stopPan = () => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopPan);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopPan);
    };
  }, []);

  useEffect(() => {
    const viewport = canvasRef.current;
    const prevZoom = prevZoomRef.current || 1;
    if (!viewport || prevZoom === zoom) return;

    const anchorX = viewport.clientWidth / 2;
    const anchorY = viewport.clientHeight / 2;

    const worldX = (viewport.scrollLeft + anchorX) / prevZoom;
    const worldY = (viewport.scrollTop + anchorY) / prevZoom;

    const nextScrollLeft = worldX * zoom - anchorX;
    const nextScrollTop = worldY * zoom - anchorY;

    const maxScrollLeft = Math.max(
      viewport.scrollWidth - viewport.clientWidth,
      0,
    );
    const maxScrollTop = Math.max(
      viewport.scrollHeight - viewport.clientHeight,
      0,
    );

    viewport.scrollLeft = Math.max(0, Math.min(nextScrollLeft, maxScrollLeft));
    viewport.scrollTop = Math.max(0, Math.min(nextScrollTop, maxScrollTop));
    prevZoomRef.current = zoom;
  }, [zoom]);

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onMouseDown={handlePanMouseDown}
      onDragOver={e => e.preventDefault()}
      className={`relative flex-1 h-full min-h-0 overflow-auto bg-slate-100 ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex min-h-full min-w-full p-4">
        <div
          style={{
            width: `calc(${canvasWidth} * ${zoom})`,
            height: scaledCanvasHeight
              ? `${scaledCanvasHeight}px`
              : `calc(${canvasHeight} * ${zoom})`,
            minWidth: 640 * zoom,
            minHeight: scaledCanvasHeight || 500 * zoom,
            flex: "0 0 auto",
            margin: "auto",
          }}
        >
          <div
            ref={stageRef}
            className="relative rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-300"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              minWidth: 640,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          >
          <div
            ref={guideVRef}
            className="pointer-events-none absolute z-50 opacity-0 transition-opacity duration-100 top-0 bottom-0 w-0 border-l-2 border-dashed border-sky-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,.25))" }}
          />
          <div
            ref={guideHRef}
            className="pointer-events-none absolute z-50 opacity-0 transition-opacity duration-100 left-0 right-0 h-0 border-t-2 border-dashed border-sky-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,.25))" }}
          />
          {elements.map(el => (
            <DraggableBox
              key={el.id}
              id={el.id}
              initialX={el.x}
              initialY={el.y}
              initialWidth={el.data?.width || 200}
              initialHeight={el.data?.height || 180}
              data={el.data}
              isSelected={selectedId === el.id}
              scale={zoom}
              onSelect={() => onSelect?.(el.id)}
              onDrag={id => {
                const node = stageRef.current?.querySelector(
                  `[data-node-id="${id}"]`,
                );
                const rect = getNodeRect(node);
                const align = computeAlignmentGuides(node, rect);
                renderGuides(align);
              }}
              onDragStop={(id, x, y) => {
                hideGuides();
                onUpdate?.(id, { x, y });
              }}
              onResize={(id, _e, _dir, ref) => {
                const node =
                  ref ||
                  stageRef.current?.querySelector(`[data-node-id="${id}"]`);
                const rect = getNodeRect(node);
                const align = computeAlignmentGuides(node, rect);
                renderGuides(align);
              }}
              onResizeStop={(id, w, h, x, y) => {
                hideGuides();
                onUpdate?.(id, {
                  x,
                  y,
                  data: { ...el.data, width: w, height: h },
                });
              }}
              onDelete={onDelete}
            />
          ))}

          {elements.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs text-slate-400">
              Arrastra elementos al lienzo para empezar.
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
