import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Layout,
  ChevronDown,
  FolderKanban,
  SquarePen,
  House,
} from "lucide-react";
import { useRealtime } from "@/context/RealtimeProvider";
import api from "../../../services/api";
import "@/styles/gateway.css";
import "../../../styles/Scada.css";
import { renderWidget } from "../components/widgets/registry.jsx";
import Button from "../../../components/Button";

const PUBLISHED_VIEWS_KEY = "publishedScadaViews";
const BASE_STAGE_WIDTH = 1176;
const BASE_STAGE_HEIGHT = 720;

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
  const stageViewportRef = useRef(null);

  const [layout, setLayout] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState("");
  const [appViewsData, setAppViewsData] = useState(null);
  const [scale, setScale] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const realtime = useRealtime();
  const allTags = realtime?.allTags || [];

  useEffect(() => {
    const handleResize = () => {
      const viewport = stageViewportRef.current;

      if (!viewport) return;

      const availableWidth = viewport.clientWidth;
      const availableHeight = viewport.clientHeight;
      const widthScale = availableWidth / BASE_STAGE_WIDTH;
      const heightScale = availableHeight / BASE_STAGE_HEIGHT;

      let nextScale = Math.min(widthScale, heightScale);

      if (nextScale > 1) nextScale = 1;
      if (nextScale < 0.2) nextScale = 0.2;

      setScale(nextScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (stageViewportRef.current) {
      resizeObserver.observe(stageViewportRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const loadFromLocalPublished = (id) => {
    const raw = localStorage.getItem(PUBLISHED_VIEWS_KEY);

    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw) || {};
      const target = parsed[id];

      if (!target) return false;

      setLayoutName(target.name || target?.views_data?.app_name || `Layout ${id}`);

      if (target.views_data?.views?.length) {
        const firstView = target.views_data.views[0];
        setLayout(normalizeElements(firstView?.elements || []));
        setActiveViewId(id);
        return true;
      }
    } catch (err) {
      console.error("Error al cargar publicacion local", err);
    }

    return false;
  };

  useEffect(() => {
    const loadLayoutFromServer = async () => {
      if (!routeViewId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const res = await api.get(`/api/scada/layout/${routeViewId}/`);

        if (res.status === 200) {
          const data = res.data;

          setLayoutName(
            data.name || data?.views_data?.app_name || `Layout ${routeViewId}`,
          );
          setAppViewsData(data?.views_data || null);

          if (data?.views_data?.views?.length) {
            const selectedView = data.views_data.views[0];
            setLayout(normalizeElements(selectedView?.elements || []));
          } else if (data && Array.isArray(data.elements)) {
            setLayout(normalizeElements(data.elements));
          } else {
            setLayout([]);
          }

          setActiveViewId(routeViewId);
        }
      } catch (err) {
        console.error("Error al cargar el layout servidor:", err);

        if (!loadFromLocalPublished(routeViewId)) {
          setLayout([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLayoutFromServer();
  }, [routeViewId]);

  const handleNavigate = (targetViewId) => {
    if (!targetViewId || !appViewsData) return;

    const targetView = appViewsData.views?.find((view) => view.id === targetViewId);

    if (!targetView) return;

    setLayout(normalizeElements(targetView.elements || []));
    setActiveViewId(targetView.id);
  };

  const resolveLiveData = (item) => {
    const settings = item.data?.settings || {};
    const variable = settings.variable || settings.attributeKey;
    const equipment = settings.equipment || item.data?.equipment;

    const tag =
      allTags.find(
        (currentTag) =>
          currentTag.variable === variable &&
          (!equipment || currentTag.equipment === equipment),
      ) ||
      allTags.find((currentTag) => currentTag.variable === variable) ||
      null;

    return {
      value:
        typeof tag?.value !== "undefined"
          ? tag.value
          : (settings?.initialValue ?? 0),
      unit: tag?.unit || settings?.unit,
      tag,
    };
  };

  const renderComponent = (item) => {
    const data = item?.data || {};
    const live = resolveLiveData(item);
    const { type, settings = {} } = data;

    const style = {
      position: "absolute",
      left: typeof item.x === "number" ? `${item.x}px` : item.x,
      top: typeof item.y === "number" ? `${item.y}px` : item.y,
      width: `${data.width || 200}px`,
      height: `${data.height || 180}px`,
      zIndex: 10,
    };

    if (
      type === "nav-button" ||
      type === "btn-primary" ||
      type === "btn-outline"
    ) {
      const targetViewId = data?.targetViewId || settings?.targetViewId;

      return (
        <div
          key={item.id}
          style={style}
          className="flex items-center justify-center"
        >
          <Button
            variant={type === "btn-outline" ? "secondary" : "primary"}
            onClick={() => targetViewId && handleNavigate(targetViewId)}
            className={`h-full w-full rounded-xl ${activeViewId === targetViewId ? "ring-2 ring-[#255f82]/30" : ""}`}
          >
            {data?.label || settings?.attributeLabel || "Boton"}
          </Button>
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#eef2f4]">
        <div className="animate-pulse rounded-[30px] border border-[#dce3e8] bg-white px-10 py-8 font-medium text-[#697682] shadow-lg">
          Sincronizando consola de produccion...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#eef2f4]">
      <div className="pointer-events-none absolute right-4 top-4 z-50 md:right-6 md:top-6">
        <div className="pointer-events-auto relative">
          <Button
            variant="secondary"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="min-w-[190px] justify-between bg-white/94 shadow-[0_18px_36px_-24px_rgba(31,41,55,0.24)] backdrop-blur-sm"
          >
            Acciones
            <ChevronDown
              className={`ml-3 h-4 w-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[230px] rounded-[24px] border border-[#dce3e8] bg-white p-3 shadow-[0_24px_40px_-24px_rgba(31,41,55,0.18)]">
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full justify-start"
                >
                  <House className="mr-2 h-4 w-4" />
                  Home
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/layout");
                  }}
                  className="w-full justify-start"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Mis HMIs
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/organizar-scada", {
                      state: {
                        loadPublishedId: routeViewId,
                        layoutId: routeViewId,
                        layOutName: layoutName,
                        editMode: true,
                        initialLayoutElements: layout,
                      },
                    });
                  }}
                  className="w-full justify-start border-[#cfe4d9] text-[#2f7a57] hover:bg-[#f4fbf7]"
                >
                  <SquarePen className="mr-2 h-4 w-4" />
                  Editar HMI
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={stageViewportRef}
        className="relative z-10 flex h-full w-full items-center justify-center p-2 md:p-3"
      >
        <div
          className="origin-center transition-all duration-300 ease-out"
          style={{
            transform: `scale(1.4)`,
            width: `${BASE_STAGE_WIDTH}px`,
            height: `${BASE_STAGE_HEIGHT}px`,
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[30px] border border-[#dce3e8] bg-white shadow-2xl"
            style={{
              width: `${BASE_STAGE_WIDTH}px`,
              height: `${BASE_STAGE_HEIGHT}px`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:20px_20px]" />

            {layout.length > 0 ? (
              layout.map((item) => renderComponent(item))
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-[#94a3b8]">
                <Layout className="h-12 w-12 opacity-20" />
                <p className="mt-4 font-medium">
                  No hay elementos en esta vista
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionView;
