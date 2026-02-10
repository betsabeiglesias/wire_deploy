import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGatewayData } from "@/hooks/useGatewayData";
import api from "../../../services/api";

import {
  parseNumericValue,
  formatNumericValue,
  clampPercent,
} from "@/modules/scada/utils";

import "@/styles/gateway.css";
import "../../../styles/Scada.css";

// Gauges
import { RingGauge } from "@/modules/scada/components/gauges/RingGauge";
import { MiniHorizontalBar } from "@/modules/scada/components/gauges/MiniHorizontalBar";
import { ValueBubble } from "@/modules/scada/components/gauges/ValueBubble";
import { BooleanLamp } from "@/modules/scada/components/gauges/BooleanLamp";
import { KwShieldGauge } from "@/modules/scada/components/gauges/KwShieldGauge";
import { PressTrendGauge } from "@/modules/scada/components/gauges/PressTrendGauge";
import { BlueDonutGauge } from "@/modules/scada/components/gauges/BlueDonutGauge";
import { NeedleGauge } from "@/modules/scada/components/gauges/NeedleGauge";
import SvgGauge from "../components/SvgGauge";
import GaugeMeter from "../components/GaugeMeter";
import HomeButton from "../../../components/HomeButton";

const PUBLISHED_VIEWS_KEY = "publishedScadaViews";

const ProductionView = () => {
  const { id: routeViewId } = useParams();
  const navigate = useNavigate();
  const { allTags, connected } = useGatewayData();

  const [layout, setLayout] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState("");
  const [appViewsData, setAppViewsData] = useState(null);

  // Cargar desde LocalStorage (Fallback)
  const loadFromLocalPublished = useCallback((id) => {
    const raw = localStorage.getItem(PUBLISHED_VIEWS_KEY);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) || {};
      const target = parsed[id];
      if (!target) return false;

      setLayoutName(target.name || target.button_name || "Layout Local");
      const viewsData = target.views_data || target;
      
      if (viewsData.views?.length) {
        setAppViewsData(viewsData);
        setLayout(viewsData.views[0].elements || []);
        setActiveViewId(viewsData.views[0].id);
        return true;
      }
    } catch (err) {
      console.error("Error cargando local:", err);
    }
    return false;
  }, []);

  // Cargar desde Servidor
  useEffect(() => {
    const loadLayout = async () => {
      if (!routeViewId) return;
      setIsLoading(true);

      try {
        const res = await api.get(`/api/scada-manager/layout/${routeViewId}/`);
        const data = res.data;

        setLayoutName(data.name || data.button_name || `HMI ${routeViewId}`);
        const viewsData = data.views_data || null;
        setAppViewsData(viewsData);

        if (viewsData?.views?.length) {
          setLayout(viewsData.views[0].elements || []);
          setActiveViewId(viewsData.views[0].id);
        } else if (data.elements) {
          setLayout(data.elements);
        }
      } catch (err) {
        console.error("Error en producción:", err);
        if (!loadFromLocalPublished(routeViewId)) {
          // Si falla el servidor y no hay local, error.
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [routeViewId, loadFromLocalPublished]);

  const handleNavigate = (targetViewId) => {
    if (!targetViewId || !appViewsData) return;
    const targetView = appViewsData.views?.find((v) => v.id === targetViewId);
    if (targetView) {
      setLayout(targetView.elements || []);
      setActiveViewId(targetView.id);
    }
  };

  const resolveLiveData = (item) => {
    const settings = item.data?.settings || {};
    const variable = settings.variable || item.data?.label;
    const equipment = settings.equipment || item.data?.equipment;

    const tag = allTags.find(
      (t) => t.variable === variable && (!equipment || t.equipment === equipment)
    ) || allTags.find((t) => t.variable === variable);

    return {
      value: tag?.value ?? settings?.initialValue ?? 0,
      unit: tag?.unit || settings?.unit,
      tag,
    };
  };

  const renderComponent = (item) => {
    const { type, settings = {}, width, height } = item.data;
    const label = settings?.attributeLabel || item.data.label;
    const live = resolveLiveData(item);
    
    const style = {
      position: "absolute",
      left: item.x,
      top: item.y,
      width: width || "200px",
      height: height || "180px",
      backgroundColor: "white",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.5rem",
      padding: "1rem",
      zIndex: 10,
    };

    const numericValue = parseNumericValue(live.value);
    const percent = clampPercent(numericValue, settings?.minValue ?? 0, settings?.maxValue ?? 100);
    const displayValue = formatNumericValue(numericValue) ?? "-";
    const labelText = live.unit ? `${displayValue} ${live.unit}` : displayValue;

    const renderInner = () => {
      switch (type) {
        case "speedometer":
        case "temperature-gauge":
          return (
            <GaugeMeter
              initialValue={numericValue || 0}
              minValue={settings?.minValue ?? 0}
              maxValue={settings?.maxValue ?? 100}
              unit={live.unit}
              label={label}
              isThermometer={type === "temperature-gauge"}
            />
          );
        case "mini-ring":
          return <RingGauge percent={percent} displayValue={displayValue} unit={live.unit} />;
        case "mini-lamp":
          return <BooleanLamp active={!!live.value} />;
        case "nav-button":
        case "btn-primary":
          const targetId = item.data?.targetViewId || settings?.targetViewId;
          return (
            <button
              className={`w-full h-full rounded transition-all active:scale-95 ${
                targetId === activeViewId ? "bg-sky-700 ring-2 ring-sky-300" : "bg-sky-600 hover:bg-sky-500"
              } text-white font-bold`}
              onClick={() => targetId && handleNavigate(targetId)}
            >
              {item.data?.label || "Ir a Vista"}
            </button>
          );
        // ... (resto de casos del switch simplificados)
        default:
          return <ValueBubble value={displayValue} unit={live.unit} />;
      }
    };

    return (
      <div key={item.id} style={style}>
        {type !== "nav-button" && (
           <div className="text-xs font-semibold text-gray-400 mb-1 truncate uppercase">{label}</div>
        )}
        <div className="flex justify-center items-center h-[calc(100%-1.5rem)]">
          {renderInner()}
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="loading-screen">Cargando HMI...</div>;

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-auto">
      {/* Barra de Herramientas Flotante */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        <div className="flex gap-2">
          <HomeButton />
          <button className="btn-secondary" onClick={() => navigate("/layout")}>Mis HMIs</button>
        </div>
        <button 
          className="btn-edit-hmi mt-4"
          onClick={() => navigate("/organizar-scada", { state: { loadPublishedId: routeViewId } })}
        >
          Editar este HMI
        </button>
      </div>

      {/* Status de Conexión */}
      <div className="fixed top-4 right-4 z-50 bg-white p-2 rounded shadow text-xs">
        <div className={connected ? "text-green-600" : "text-red-600"}>
          ● {connected ? "En Vivo" : "Desconectado"}
        </div>
        <div className="font-bold border-t mt-1 pt-1">{layoutName}</div>
      </div>

      {/* Canvas de Producción */}
      <div className="relative w-[1280px] h-[800px] mx-auto mt-16 bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {layout.map(renderComponent)}
      </div>
    </div>
  );
};

export default ProductionView;