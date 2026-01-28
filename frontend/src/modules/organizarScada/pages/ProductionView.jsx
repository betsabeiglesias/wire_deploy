import React, { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useGatewayData } from "@/hooks/useGatewayData";
import api from "../../../services/api";
import { attemptRefreshToken } from "../../../services/authService";

import {
  parseNumericValue,
  formatNumericValue,
  clampPercent,
} from "@/modules/scada/utils";

import "@/styles/gateway.css";

import "../../../styles/Scada.css";

import { RingGauge } from "@/modules/scada/components/gauges/RingGauge";

import { MiniHorizontalBar } from "@/modules/scada/components/gauges/MiniHorizontalBar";

import { ValueBubble } from "@/modules/scada/components/gauges/ValueBubble";

import { BooleanLamp } from "@/modules/scada/components/gauges/BooleanLamp";

import { KwShieldGauge } from "@/modules/scada/components/gauges/KwShieldGauge";

import { PressTrendGauge } from "@/modules/scada/components/gauges/PressTrendGauge";

import { BlueDonutGauge } from "@/modules/scada/components/gauges/BlueDonutGauge";

import { NeedleGauge } from "@/modules/scada/components/gauges/NeedleGauge";

import SvgGauge from "../components/widgets/standard/SvgGauge";

import GaugeMeter from "../components/widgets/standard/GaugeMeter";

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

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) return null;

    try {
      const res = await api.post("/api/token/refresh/", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) return null;

      const data = await res.json();

      if (data?.access) {
        localStorage.setItem("token", data.access);

        return data.access;
      }
    } catch (err) {
      console.error("No se pudo refrescar el token en producci�n", err);
    }

    return null;
  };

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

      let token = localStorage.getItem("token");

      if (!token) {
        token = await refreshAccessToken();

        if (!token) {
          alert("Sesion caducada. Inicia sesion de nuevo.");

          navigate("/login");

          setIsLoading(false);

          return;
        }
      }

      try {
        const doRequest = async (activeToken) =>
          api.get(`/api/scada-manager/layout/${routeViewId}/`, {
            headers: {
              Authorization: `Bearer ${activeToken}`,

              "Content-Type": "application/json",
            },
          });

        let res = await doRequest(token);

        if (res.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            token = newToken;

            res = await doRequest(token);
          }
        }

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
      settings.attributeKey ||
      settings.attributeLabel ||
      item.data?.label;

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
    const { type, settings = {}, width, height } = item.data;

    const label = settings?.attributeLabel || item.data.label;

    const live = resolveLiveData(item);

    const value = live.value;

    const unit = live.unit;

    const w = typeof width === "number" ? `${width}px` : width || "200px";

    const h = typeof height === "number" ? `${height}px` : height || "180px";

    const x = typeof item.x === "number" ? `${item.x}px` : item.x || "0px";

    const y = typeof item.y === "number" ? `${item.y}px` : item.y || "0px";

    const style = {
      position: "absolute",

      left: x,

      top: y,

      width: w,

      height: h,

      backgroundColor: "white",

      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",

      borderRadius: "0.5rem",

      padding: "1rem",

      overflow: "hidden",

      zIndex: 10,
    };

    const renderGaugeContent = () => {
      const numericValue = parseNumericValue(value);

      const percent = clampPercent(
        numericValue,
        settings?.minValue ?? 0,
        settings?.maxValue ?? 100,
      );

      const displayValue = formatNumericValue(numericValue) ?? "-";

      const labelText = unit ? `${displayValue} ${unit}` : displayValue;

      switch (type) {
        case "speedometer":

        case "temperature-gauge": {
          const isThermo = type === "temperature-gauge";

          return (
            <GaugeMeter
              initialValue={numericValue !== null ? numericValue : 0}
              minValue={settings?.minValue ?? 0}
              maxValue={settings?.maxValue ?? 100}
              unit={unit}
              label={label}
              isThermometer={isThermo}
            />
          );
        }

        case "mini-ring":
          return (
            <RingGauge
              percent={percent}
              displayValue={displayValue}
              unit={unit}
            />
          );

        case "mini-horizontal":
          return <MiniHorizontalBar percent={percent} label={labelText} />;

        case "mini-donut":
          return <BlueDonutGauge percent={percent} label={labelText} />;

        case "mini-bubble":
          return <ValueBubble value={displayValue} unit={unit} />;

        case "mini-lamp":
          return <BooleanLamp active={!!value} />;

        case "mini-needle":
          return (
            <NeedleGauge percent={percent} value={displayValue} unit={unit} />
          );

        case "power-card":
          return (
            <KwShieldGauge value={displayValue} unit={unit} label={label} />
          );

        case "press-card":
          return (
            <PressTrendGauge
              value={displayValue}
              unit={unit}
              label={label}
              trend={0}
            />
          );

        case "svg-gauge": {
          const gaugeValue = parseNumericValue(value);

          return (
            <SvgGauge
              options={settings?.gaugeOptions || item.data?.gaugeOptions}
              value={gaugeValue !== null ? gaugeValue : 0}
              width={w}
              height={h}
            />
          );
        }

        case "nav-button":

        case "btn-primary":

        case "btn-outline": {
          const buttonLabel = item.data?.label || label || "Button";

          const isPrimary = type === "btn-primary" || type === "nav-button";
          const targetViewId =
            item.data?.targetViewId || item.data?.settings?.targetViewId;

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

          // Estilo extra para indicar que es el activo actual (si fuera una navegación tipo tabs)
          const activeClass = isActive
            ? "ring-2 ring-offset-1 ring-sky-500"
            : "";

          return (
            <button
              className={`${baseClass} ${primaryClass} ${activeClass}`}
              onClick={() => hasAction && handleNavigate(targetViewId)}
            >
              {buttonLabel}
            </button>
          );
        }

        case "label-pill":

        case "label-badge": {
          const labelTextFinal = item.data?.label || label || "Label";

          const isPill = type === "label-pill";

          const labelClass = isPill
            ? "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-sm px-4 py-1 border border-emerald-100"
            : "inline-flex items-center rounded bg-slate-800 text-slate-50 text-xs px-3 py-1 uppercase tracking-wide";

          return <span className={labelClass}>{labelTextFinal}</span>;
        }

        case "card-soft":

        case "card-elevated": {
          const cardText = item.data?.label || label || "Card Content";

          const isElevated = type === "card-elevated";

          const cardClass = isElevated
            ? "rounded-lg border border-slate-200 bg-white text-sm px-4 py-3 shadow-md"
            : "rounded-lg border border-slate-200 bg-slate-50 text-sm px-4 py-3 shadow-sm";

          return <div className={cardClass}>{cardText}</div>;
        }

        default:
          return <div className="text-red-500 text-xs">Unknown: {type}</div>;
      }
    };

    if (type === "mini-table") {
      return (
        <div key={item.id} style={style}>
          <h3 className="font-bold mb-2 text-sm" title={label}>
            {label}
          </h3>

          <div className="overflow-auto h-[calc(100%-2rem)]">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-1">Var</th>

                  <th className="text-left p-1">Val</th>
                </tr>
              </thead>

              <tbody>
                {settings?.rows?.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-1">{row.variable}</td>

                    <td className="p-1">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (type === "mini-chart") {
      return (
        <div key={item.id} style={style}>
          <h3 className="font-bold mb-2 text-sm" title={label}>
            {label}
          </h3>

          <div className="flex items-end justify-between h-[calc(100%-2rem)] gap-1 pb-2">
            {settings?.series?.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${val}%` }}
                className="flex-1 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} style={style}>
        <div
          className="text-sm font-medium text-gray-500 mb-2 truncate"
          title={label}
        >
          {label}
        </div>

        <div className="flex justify-center items-center h-[calc(100%-2rem)]">
          {renderGaugeContent()}
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
          width: `${baseWidth}px`,
          height: "840px", // Altura base fija o auto si se prefiere
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
