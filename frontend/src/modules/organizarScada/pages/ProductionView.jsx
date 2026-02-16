import React, { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useGatewayData } from "@/hooks/useGatewayData";
import api from "../../../services/api";
import "@/styles/gateway.css";
import "../../../styles/Scada.css";
import { renderWidget } from "../components/widgets/registry.jsx";

import HomeButton from "../../../components/HomeButton";

const PUBLISHED_VIEWS_KEY = "publishedScadaViews";

const ProductionView = () => {
  const { id: routeViewId } = useParams();

  const navigate = useNavigate();

  const [layout, setLayout] = useState([]);

  const [activeViewId, setActiveViewId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [layoutName, setLayoutName] = useState("");

  const [appViewsData, setAppViewsData] = useState(null);

  const { allTags, connected } = useGatewayData();

  // Lógica de Escalado Responsivo (Moved to top to prevent conditional hook error)
  const [scale, setScale] = useState(1);
  const baseWidth = 1291; // Ancho base del diseño

  useEffect(() => {
    const handleResize = () => {
      const padding = 32; // Espacio lateral
      const availableWidth = window.innerWidth - padding;

      // Calcular escala basada en ancho (prioridad)
      let newScale = availableWidth / baseWidth;

      // Limitar escala máxima a 1
      if (newScale > 1) newScale = 1;

      setScale(newScale);
    };

    handleResize(); // Calculo inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const loadFromLocalPublished = (id) => {
    const raw = localStorage.getItem(PUBLISHED_VIEWS_KEY);

    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw) || {};

      const target = parsed[id];

      if (!target) return false;

      setLayoutName(
        target.button_name ||
          target.name ||
          target?.views_data?.app_name ||
          `Layout ${id}`,
      );

      if (target.views_data?.views?.length) {
        const firstView = target.views_data.views[0];

        setLayout(firstView?.elements || []);

        setActiveViewId(id);

        return true;
      }

      if (Array.isArray(target.layout)) {
        setLayout(target.layout);

        setActiveViewId(id);

        return true;
      }
    } catch (err) {
      console.error("No se pudo cargar la publicaci�n local", err);
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
        const res = await api.get(`/api/scada-manager/layout/${routeViewId}/`);

        if (res.status === 200) {
          const data = res.data;

          setLayoutName(
            data.button_name ||
              data.name ||
              data?.views_data?.app_name ||
              `Layout ${routeViewId}`,
          );

          setAppViewsData(data?.views_data || null);

          if (data?.views_data?.views?.length) {
            const viewsArr = data.views_data.views;

            const selectedView = viewsArr[0];

            setLayout(selectedView?.elements || []);
          } else if (Array.isArray(data)) {
            setLayout(data);
          } else if (data && Array.isArray(data.elements)) {
            setLayout(data.elements);
          } else {
            setLayout([]);
          }

          setActiveViewId(routeViewId);
        } else {
          console.error(
            "Error al cargar el layout desde el servidor",
            res.status,
          );

          if (res.status === 403) {
            const loadedLocal = loadFromLocalPublished(routeViewId);

            if (!loadedLocal) {
              alert(
                "No tienes permiso para ver esta vista. Inicia sesi�n nuevamente.",
              );

              navigate("/login");

              return;
            }
          } else if (!loadFromLocalPublished(routeViewId)) {
            setLayout([]);
          }
        }
      } catch (err) {
        console.error("Error al cargar el layout:", err);

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
    const targetView = appViewsData.views?.find((v) => v.id === targetViewId);

    if (targetView) {
      setLayout(targetView.elements || []);
      setActiveViewId(targetView.id);
      // Opcional: actualizar URL sin recargar si se desea
      // window.history.pushState(null, "", `/scada/production/${encodeURIComponent(routeViewId)}#${targetViewId}`);
    } else {
      console.warn("Vista destino no encontrada:", targetViewId);
    }
  };

  const resolveLiveData = (item) => {
    const settings = item.data?.settings || {};

    const variable =
      settings.variable ||
      settings.attributeKey;
      // settings.attributeLabel ||
      // item.data?.label;

    const equipment = settings.equipment || item.data?.equipment;

    const site = settings.site;

    const area = settings.area;

    const line = settings.line;

    const cell = settings.cell;

    const preferred = allTags.find(
      (tag) =>
        tag.variable === variable &&
        (!equipment || tag.equipment === equipment) &&
        (!site || tag.site === site) &&
        (!area || tag.area === area) &&
        (!line || tag.line === line) &&
        (!cell || tag.cell === cell),
    );

    const fallback = allTags.find((tag) => tag.variable === variable);

    const tag = preferred || fallback || null;

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
    const { type, settings = {} } = data;
    const live = resolveLiveData(item);

    const numericWidth =
      typeof data.width === "number"
        ? data.width
        : Number.parseFloat(data.width) || 200;
    const numericHeight =
      typeof data.height === "number"
        ? data.height
        : Number.parseFloat(data.height) || 180;

    const x = typeof item.x === "number" ? `${item.x}px` : item.x || "0px";
    const y = typeof item.y === "number" ? `${item.y}px` : item.y || "0px";

    const style = {
      position: "absolute",
      left: x,
      top: y,
      width: `${numericWidth}px`,
      height: `${numericHeight}px`,
      padding: 0,
      backgroundColor: "transparent",
      boxShadow: "none",
      borderRadius: 0,
      overflow: "visible",
      zIndex: 10,
    };

    if (type === "nav-button" || type === "btn-primary" || type === "btn-outline") {
      const buttonLabel = data?.label || settings?.attributeLabel || "Button";
      const isPrimary = type === "btn-primary" || type === "nav-button";
      const targetViewId = data?.targetViewId || settings?.targetViewId;
      const isActive = targetViewId && activeViewId === targetViewId;
      const hasAction = !!targetViewId;
      const baseClass =
        "px-4 py-2 rounded-md shadow-sm font-medium transition-all active:scale-95 flex items-center justify-center";
      const primaryClass = isPrimary
        ? hasAction
          ? "bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
          : "bg-gray-400 text-white cursor-default"
        : hasAction
          ? "border border-sky-500 text-sky-600 hover:bg-sky-50 cursor-pointer"
          : "border border-gray-300 text-gray-400 cursor-default";
      const activeClass = isActive ? "ring-2 ring-offset-1 ring-sky-500" : "";

      return (
        <div key={item.id} style={style} className="flex items-center justify-center">
          <button
            className={`${baseClass} ${primaryClass} ${activeClass}`}
            onClick={() => hasAction && handleNavigate(targetViewId)}
          >
            {buttonLabel}
          </button>
        </div>
      );
    }

    return (
      <div key={item.id} style={style}>
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          {renderWidget({
            data,
            live,
            width: numericWidth,
            height: numericHeight,
            theme: "theme-clean",
            valueHistory: [],
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando vista... ?</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden flex flex-col items-center">
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        {/* Fila superior */}
        <div className="flex gap-2">
          <HomeButton />

          <button
            className="px-3 py-1.5 rounded border hover:bg-gray-50 bg-white shadow-sm font-medium text-sm text-gray-700"
            onClick={() => navigate("/layout")}
            title="Volver a SCADA"
          >
            Mis HMIs
          </button>
        </div>

        {/* Botón inferior */}
        <button
          className="border border-green-600
      text-green-600
      px-4 py-2
      mt-2
      rounded
      bg-white
      hover:bg-green-50
      hover:text-green-700
      transition-colors
      cursor-pointer shadow-sm text-sm font-semibold"
          onClick={() =>
            navigate("/organizar-scada", {
              state: {
                loadPublishedId: routeViewId,
                layoutId: activeViewId,
              },
            })
          }
        >
          Editar HMI
        </button>
      </div>

      <div className="fixed top-4 right-4 z-50 bg-white px-3 py-1 rounded shadow text-sm border border-gray-200">
        {connected ? (
          <span className="text-green-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Conectado
          </span>
        ) : (
          <span className="text-red-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Desconectado
          </span>
        )}

        {layoutName && (
          <div
            className="text-gray-700 text-xs mt-1 font-semibold text-right truncate max-w-[150px]"
            title={layoutName}
          >
            {layoutName}
          </div>
        )}
      </div>

      {layout.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p className="text-xl mb-4">No hay vista disponible.</p>

          <p>Selecciona un layout desde el editor.</p>
        </div>
      )}

      {/* Contenedor Escalable Centrado */}
      <div
        className="mt-16 transition-transform duration-200 ease-out origin-top"
        style={{
          transform: `scale(${scale})`,
          width: "1176px",
          height: "720px", // Altura base fija o auto si se prefiere
        }}
      >
        <div className="relative w-full h-full bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
          {layout.map((item) => renderComponent(item))}
        </div>
      </div>
    </div>
  );
};

export default ProductionView;



