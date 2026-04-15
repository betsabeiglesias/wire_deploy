import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
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
    x: 0,
    y: 0,
  });


  const [bgSize, setBgSize] = useState({
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    });

  const backgroundWidget = useMemo(
    () =>
      elements.find(
        (el) =>
          el?.data?.type === "image-widget" &&
          el?.data?.settings?.isBackground
      ) || null,
    [elements]
  );

  const backgroundIsLocked = backgroundWidget?.data?.settings?.is_locked === true;


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
    const bgWidget = backgroundWidget;

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
        x: settings.bgX || 0,
        y: settings.bgY || 0,
      });

      setBgSize({
        width: settings.bgWidth || BASE_WIDTH,
        height: settings.bgHeight || BASE_HEIGHT,
      });

    } else {
      setBackgroundImage(null);
      setBgSize({
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
      });
    }
  }, [backgroundWidget]);

  
  

  const effectiveZoom = zoom * autoZoom;

  const orderedElements = useMemo(() => {
    return [...elements].sort((a, b) => {
      const aZ = Number(a?.data?.settings?.z_index);
      const bZ = Number(b?.data?.settings?.z_index);
      const safeAZ = Number.isFinite(aZ) ? aZ : 0;
      const safeBZ = Number.isFinite(bZ) ? bZ : 0;
      return safeAZ - safeBZ;
    });
  }, [elements]);


  

  const handleDrop = (e) => {
  e.preventDefault();
      onDrop?.(e, canvasRef.current);
    };

  const persistBackgroundSettings = useCallback((patch) => {
    if (!backgroundWidget?.id) return;

    onUpdate?.(backgroundWidget.id, {
      data: {
        ...backgroundWidget.data,
        settings: {
          ...(backgroundWidget.data?.settings || {}),
          ...patch,
        },
      },
    });
  }, [backgroundWidget, onUpdate]);

  const handleBackgroundDragStart = useCallback((e) => {
    if (isLiveMode || backgroundIsLocked) return;

    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initX = bgTransform.x;
    const initY = bgTransform.y;
    let nextX = initX;
    let nextY = initY;

    const onMove = (ev) => {
      nextX = initX + (ev.clientX - startX);
      nextY = initY + (ev.clientY - startY);
      setBgTransform((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      persistBackgroundSettings({
        bgX: nextX,
        bgY: nextY,
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [bgTransform.x, bgTransform.y, backgroundIsLocked, isLiveMode, persistBackgroundSettings]);


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
        onClick={!isLiveMode ? (e) => { if (e.target === e.currentTarget) onSelect?.(null); } : undefined}
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
            onMouseDown={handleBackgroundDragStart}
            onClick={() => !isLiveMode && onSelect?.(backgroundWidget?.id, false)}
            style={{
              position: "absolute",
              inset: 0,
              cursor: backgroundIsLocked ? "default" : "grab",
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
                `,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
            />

            {/* ========================= */}
            {/* RESIZE HANDLES (4 lados) */}
            {/* ========================= */}

            {/* RIGHT */}
            {!backgroundIsLocked && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startWidth = bgSize.width;
                  let nextWidth = startWidth;

                  const onMove = (ev) => {
                    const delta = ev.clientX - startX;
                    nextWidth = Math.max(200, startWidth + delta);
                    setBgSize((prev) => ({
                      ...prev,
                      width: nextWidth,
                    }));
                  };

                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                    persistBackgroundSettings({ bgWidth: nextWidth });
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
            )}

            {/* BOTTOM */}
            {!backgroundIsLocked && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startY = e.clientY;
                  const startHeight = bgSize.height;
                  let nextHeight = startHeight;

                  const onMove = (ev) => {
                    const delta = ev.clientY - startY;
                    nextHeight = Math.max(200, startHeight + delta);
                    setBgSize((prev) => ({
                      ...prev,
                      height: nextHeight,
                    }));
                  };

                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                    persistBackgroundSettings({ bgHeight: nextHeight });
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
            )}

            {/* BOTTOM-RIGHT CORNER */}
            {!backgroundIsLocked && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = bgSize.width;
                  const startHeight = bgSize.height;
                  let nextWidth = startWidth;
                  let nextHeight = startHeight;

                  const onMove = (ev) => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    nextWidth = Math.max(200, startWidth + dx);
                    nextHeight = Math.max(200, startHeight + dy);

                    setBgSize({
                      width: nextWidth,
                      height: nextHeight,
                    });
                  };

                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                    persistBackgroundSettings({
                      bgWidth: nextWidth,
                      bgHeight: nextHeight,
                    });
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
            )}
          </div>
        )}

        {/* ELEMENTOS */}
        {orderedElements.map((el) => {
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
              onSelect={() => !isLiveMode && onSelect?.(el.id, false)}
              onDoubleClick={() => !isLiveMode && onSelect?.(el.id, true)}
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
              scale={effectiveZoom}
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
