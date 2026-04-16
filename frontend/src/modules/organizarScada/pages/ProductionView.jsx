import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layers } from "lucide-react";
import useRealtimeStore from "@/store/useRealtimeStore";
import { useProjectTags } from "../hooks/useProjectTags";
import api from "../../../services/api";
import "@/styles/gateway.css";
import "../../../styles/Scada.css";
import { renderWidget } from "../components/widgets/registry.jsx";
import ProductionTopBar from "../components/layout/ProductionTopBar.jsx";
import ProductionSidebar from "../components/layout/ProductionSidebar.jsx";

const PUBLISHED_VIEWS_KEY = "publishedScadaViews";
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const normalizeElements = (items = []) =>
  items.map((item, idx) => ({
    id: item.id || Date.now() + idx,
    x: item.x ?? 100,
    y: item.y ?? 100,
    width: item.width ?? item.data?.width ?? 200,
    height: item.height ?? item.data?.height ?? 180,
    data: item.data || item,
  }));

const ProductionView = () => {
  const { id: routeViewId } = useParams();
  const navigate = useNavigate();
  const viewportRef = useRef(null);

  const [elements, setElements] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState("");
  const [appViewsData, setAppViewsData] = useState(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [bgTransform, setBgTransform] = useState({ x: 0, y: 0 });
  const [bgSize, setBgSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });

  const allTags = useRealtimeStore((s) => s.allTags);
  const tagsMap = useRealtimeStore((s) => s.tagsMap);

  // Mismo sistema de resolución que usa el editor en live mode:
  // carga las tablas del layout para poder resolver variableId → tagId
  const { tags: projectTags } = useProjectTags(routeViewId, tagsMap);

  // Auto-scale para ajustar el lienzo al viewport, igual que CanvasEditor
  useEffect(() => {
    const updateScale = () => {
      if (!viewportRef.current) return;
      const { clientWidth, clientHeight } = viewportRef.current;
      const scaleX = clientWidth / BASE_WIDTH;
      const scaleY = clientHeight / BASE_HEIGHT;
      const next = Math.min(scaleX, scaleY, 1);
      setScale(Math.max(next, 0.1));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    const observer = new ResizeObserver(updateScale);
    if (viewportRef.current) observer.observe(viewportRef.current);

    return () => {
      window.removeEventListener("resize", updateScale);
      observer.disconnect();
    };
  }, []);

  // Fullscreen API
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Actualizar background cuando cambian los elementos
  const backgroundWidget = useMemo(
    () =>
      elements.find(
        (el) =>
          el?.data?.type === "image-widget" &&
          el?.data?.settings?.isBackground
      ) || null,
    [elements]
  );

  useEffect(() => {
    if (backgroundWidget) {
      const s = backgroundWidget.data.settings;
      const src = s.imageBase64 || s.src || s.url || s.image || s.path;
      setBackgroundImage(src || null);
      setBgTransform({ x: s.bgX || 0, y: s.bgY || 0 });
      setBgSize({ width: s.bgWidth || BASE_WIDTH, height: s.bgHeight || BASE_HEIGHT });
    } else {
      setBackgroundImage(null);
      setBgSize({ width: BASE_WIDTH, height: BASE_HEIGHT });
    }
  }, [backgroundWidget]);

  const applyViewData = (data) => {
    setLayoutName(data.name || data?.views_data?.app_name || `Layout ${routeViewId}`);
    setAppViewsData(data?.views_data || null);

    if (data?.views_data?.views?.length) {
      const firstView = data.views_data.views[0];
      setElements(normalizeElements(firstView?.elements || []));
    } else if (data && Array.isArray(data.elements)) {
      setElements(normalizeElements(data.elements));
    } else {
      setElements([]);
    }

    setActiveViewId(routeViewId);
  };

  const loadFromLocalPublished = (id) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(PUBLISHED_VIEWS_KEY) || "{}");
      const target = parsed[id];
      if (!target) return false;
      applyViewData(target);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!routeViewId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    api
      .get(`/api/scada/layout/${routeViewId}/`)
      .then((res) => {
        if (res.status === 200) applyViewData(res.data);
      })
      .catch(() => {
        if (!loadFromLocalPublished(routeViewId)) setElements([]);
      })
      .finally(() => setIsLoading(false));
  }, [routeViewId]);

  const handleNavigate = (targetViewId) => {
    if (!targetViewId || !appViewsData) return;
    const targetView = appViewsData.views?.find((v) => v.id === targetViewId);
    if (!targetView) return;
    setElements(normalizeElements(targetView.elements || []));
    setActiveViewId(targetView.id);
  };

  // Misma lógica de resolución que WidgetLiveWrapper + useLiveTag:
  // 1. settings.tagId       → lookup directo en tagsMap
  // 2. settings.variableId  → resolución via projectTags → tagId → tagsMap
  // 3. Fallback legacy      → búsqueda por variable + equipment en allTags
  const resolveLiveData = (item) => {
    const settings = item.data?.settings || {};
    let entry = null;

    if (settings.tagId) {
      entry = tagsMap.get(settings.tagId) ?? null;
    } else if (settings.variableId && projectTags?.length) {
      const pt = projectTags.find((t) => t.id === settings.variableId);
      if (pt?.tagId) {
        entry = tagsMap.get(pt.tagId) ?? null;
      } else if (pt?.equipment && pt?.variable) {
        // projectTag sin tagId aún: buscar en tagsMap por equipment+variable
        for (const e of tagsMap.values()) {
          if (e.equipment === pt.equipment && e.variable === pt.variable) {
            entry = e;
            break;
          }
        }
      }
    }

    // Fallback legacy: settings.variable / settings.equipment
    if (!entry) {
      const variable = settings.variable || settings.attributeKey;
      const equipment = settings.equipment || item.data?.equipment;
      if (variable) {
        entry =
          allTags.find((t) => t.variable === variable && (!equipment || t.equipment === equipment)) ||
          allTags.find((t) => t.variable === variable) ||
          null;
      }
    }

    return {
      value: typeof entry?.value !== "undefined" ? entry.value : (settings?.initialValue ?? 0),
      unit: entry?.unit || settings?.unit,
      tag: entry,
    };
  };

  // Ordenar por z_index igual que el editor
  const orderedElements = useMemo(
    () =>
      [...elements].sort((a, b) => {
        const az = Number.isFinite(Number(a?.data?.settings?.z_index))
          ? Number(a.data.settings.z_index)
          : 0;
        const bz = Number.isFinite(Number(b?.data?.settings?.z_index))
          ? Number(b.data.settings.z_index)
          : 0;
        return az - bz;
      }),
    [elements]
  );

  const renderElement = (item) => {
    const data = item?.data || {};
    const settings = data.settings || {};

    // Ocultar elementos no visibles
    if (settings.is_visible === false) return null;

    // Saltar el widget de fondo (se renderiza separado)
    if (data.type === "image-widget" && settings.isBackground) return null;

    const live = resolveLiveData(item);
    const { type } = data;

    const style = {
      position: "absolute",
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: `${data.width || 200}px`,
      height: `${data.height || 180}px`,
      zIndex: Number.isFinite(Number(settings.z_index)) ? Number(settings.z_index) : 10,
    };

    if (type === "nav-button" || type === "btn-primary" || type === "btn-outline") {
      const targetViewId = data?.targetViewId || settings?.targetViewId;
      return (
        <div key={item.id} style={style} className="flex items-center justify-center">
          <button
            onClick={() => targetViewId && handleNavigate(targetViewId)}
            className={`
              h-full w-full rounded-[6px] border text-[11px] font-medium transition-colors
              ${type === "btn-outline"
                ? "border-[#29468B] bg-transparent text-[#29468B] hover:bg-[#EEF3FF]"
                : "border-transparent bg-[#29468B] text-white hover:bg-[#1F3A73]"
              }
              ${activeViewId === targetViewId ? "ring-2 ring-[#29468B]/30" : ""}
            `}
          >
            {data?.label || settings?.attributeLabel || "Botón"}
          </button>
        </div>
      );
    }

    return (
      <div key={item.id} style={style}>
        {renderWidget({
          data,
          live,
          width: data.width,
          height: data.height,
          theme: "theme-clean",
          valueHistory: [],
        })}
      </div>
    );
  };

  // ----- LOADING -----
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#E9EAED]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#29468B] border-t-transparent" />
          <span className="text-[12px] font-medium text-slate-500">
            Cargando consola de producción...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#E9EAED]">
      {/* ── TOP BAR ── */}
      <ProductionTopBar
        layoutName={layoutName}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onHome={() => navigate("/")}
        onMyHMIs={() => navigate("/layout")}
        onEditHMI={() =>
          navigate("/organizar-scada", {
            state: {
              loadPublishedId: routeViewId,
              layoutId: routeViewId,
              layOutName: layoutName,
              editMode: true,
              initialLayoutElements: elements,
            },
          })
        }
      />

      {/* ── BODY: sidebar + canvas ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navegación de vistas (view-level) */}
        <ProductionSidebar
          views={appViewsData?.views}
          activeViewId={activeViewId}
          onNavigate={handleNavigate}
        />

        {/* ── CANVAS VIEWPORT ── */}
        <div
          ref={viewportRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-white"
        >
        {/* Lienzo escalado — igual que CanvasEditor */}
        <div
          style={{
            width: BASE_WIDTH * scale,
            height: BASE_HEIGHT * scale,
            position: "relative",
          }}
        >
          <div
            className="absolute top-0 left-0 overflow-hidden bg-white"
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >

            {/* Imagen de fondo */}
            {backgroundImage && (
              <img
                src={backgroundImage}
                alt="background"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: bgSize.width,
                  height: bgSize.height,
                  transform: `translate(${bgTransform.x}px, ${bgTransform.y}px)`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}

            {/* Widgets */}
            {orderedElements.length > 0 ? (
              orderedElements.map(renderElement)
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                <Layers className="h-12 w-12 opacity-20" />
                <p className="text-[13px] font-medium">No hay elementos en esta vista</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionView;
