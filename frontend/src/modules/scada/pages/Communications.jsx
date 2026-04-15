// frontend/src/modules/scada/pages/Communications.jsx

import "@/styles/gateway.css";
import { useState, useMemo } from "react";
import { parseNumericValue, formatNumericValue, clampPercent } from "../utils";
import { Filter, Wifi, WifiOff, Clock } from "lucide-react";

// Gauges
import { RingGauge } from "../components/gauges/RingGauge";
import { MiniHorizontalBar } from "../components/gauges/MiniHorizontalBar";
import { ValueBubble } from "../components/gauges/ValueBubble";
import { BooleanLamp } from "../components/gauges/BooleanLamp";
import { KwShieldGauge } from "../components/gauges/KwShieldGauge";
import { PressTrendGauge } from "../components/gauges/PressTrendGauge";
import { BlueDonutGauge } from "../components/gauges/BlueDonutGauge";
import { NeedleGauge } from "../components/gauges/NeedleGauge";

import { Filters } from "../components/Filters";
import { GatewayTable } from "../components/GatewayTable";

import { useRealtime } from "@/context/RealtimeProvider";
import HomeButton from "../../../components/HomeButton";

export default function Communications() {
  const { connected, dataStale, allTags } = useRealtime();

  const [filters, setFilters] = useState({
    site: "", area: "", line: "", cell: "", equipment_id: "",
  });

  // ---------------------------
  // FILTROS ISA-95
  // ---------------------------
  const sites = useMemo(() => [...new Set(allTags.map((t) => t.site))], [allTags]);

  const areas = useMemo(
    () => [...new Set(allTags.filter((t) => !filters.site || t.site === filters.site).map((t) => t.area))],
    [allTags, filters.site]
  );

  const lines = useMemo(
    () => [...new Set(
      allTags
        .filter((t) => (!filters.site || t.site === filters.site) && (!filters.area || t.area === filters.area))
        .map((t) => t.line)
    )],
    [allTags, filters.site, filters.area]
  );

  const cells = useMemo(
    () => [...new Set(
      allTags
        .filter((t) =>
          (!filters.site || t.site === filters.site) &&
          (!filters.area || t.area === filters.area) &&
          (!filters.line || t.line === filters.line)
        )
        .map((t) => t.cell)
    )],
    [allTags, filters.site, filters.area, filters.line]
  );

  const equipments = useMemo(
    () => [...new Set(
      allTags
        .filter((t) =>
          (!filters.site || t.site === filters.site) &&
          (!filters.area || t.area === filters.area) &&
          (!filters.line || t.line === filters.line) &&
          (!filters.cell || t.cell === filters.cell)
        )
        .map((t) => t.equipment_id)
    )],
    [allTags, filters.site, filters.area, filters.line, filters.cell]
  );

  // ---------------------------
  // FILTRADO FINAL
  // ---------------------------
  const filtered = useMemo(
    () =>
      allTags.filter((t) =>
        (!filters.site || t.site === filters.site) &&
        (!filters.area || t.area === filters.area) &&
        (!filters.line || t.line === filters.line) &&
        (!filters.cell || t.cell === filters.cell) &&
        (!filters.equipment_id || t.equipment_id === filters.equipment_id)
      ),
    [allTags, filters]
  );

  // ---------------------------
  // WIDGETS / GAUGES
  // ---------------------------
  const numericVariants = ["ring", "horizontal", "donut", "needle", "bubble"];
  let numericVariantIndex = 0;

  const renderGaugeCard = (tag, index) => {
    const { value, variable, unit } = tag;
    const equipmentLabel = tag.equipment_id || "Equipo sin identificar";

    if (value === null || typeof value === "undefined") return null;

    if (typeof value === "boolean") {
      return (
        <div key={`boolean-${index}`} className="mini-card">
          <div className="mini-title">{variable}</div>
          <BooleanLamp active={value} />
          <div className="mini-equipment-label" title={equipmentLabel}>{equipmentLabel}</div>
        </div>
      );
    }

    const numericValue = parseNumericValue(value);
    if (numericValue !== null) {
      const variableKey = typeof variable === "string" ? variable.toLowerCase() : "";
      const variant =
        variableKey.includes("power") ? "kw-card"
        : variableKey.includes("press") ? "press-card"
        : numericVariants[numericVariantIndex++ % numericVariants.length];

      const percent      = clampPercent(numericValue);
      const displayValue = formatNumericValue(numericValue) ?? "-";
      const labelText    = unit ? `${displayValue} ${unit}` : displayValue;

      const gaugeContent = {
        ring:        <RingGauge percent={percent} displayValue={displayValue} unit={unit} />,
        horizontal:  <MiniHorizontalBar percent={percent} label={labelText} />,
        donut:       <BlueDonutGauge percent={percent} label={labelText} />,
        needle:      <NeedleGauge percent={percent} value={displayValue} unit={unit} />,
        "kw-card":   <KwShieldGauge value={displayValue} unit={unit || "power"} label={variable} />,
        "press-card": <PressTrendGauge value={displayValue} unit={unit} label={variable} trend={(percent ?? 0) - 50} />,
        bubble:      <ValueBubble value={displayValue} unit={unit} />,
      }[variant] || <RingGauge percent={percent} displayValue={displayValue} unit={unit} />;

      return (
        <div key={`numeric-${index}`} className="mini-card">
          <div className="mini-title">{variable}</div>
          {gaugeContent}
          <div className="mini-equipment-label" title={equipmentLabel}>{equipmentLabel}</div>
        </div>
      );
    }

    return (
      <div key={`string-${index}`} className="mini-card">
        <div className="mini-title">{variable}</div>
        <ValueBubble value={String(value)} />
        <div className="mini-equipment-label" title={equipmentLabel}>{equipmentLabel}</div>
      </div>
    );
  };

  // ---------------------------
  // BADGE DE CONEXIÓN
  // ---------------------------
  const connectionBadge = !connected ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[4px] text-[8px] font-bold uppercase bg-[#FEF2F2] text-[#DC2626]">
      <WifiOff className="h-3 w-3" aria-hidden="true" /> Desconectado de MQTT
    </span>
  ) : dataStale ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[4px] text-[8px] font-bold uppercase bg-[#FFF8EC] text-[#B45309]">
      <Clock className="h-3 w-3" aria-hidden="true" /> Conectado — sin datos (PLC offline)
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[4px] text-[8px] font-bold uppercase bg-[#EDF8EF] text-[#2A8B4B]">
      <Wifi className="h-3 w-3" aria-hidden="true" /> Conectado — recibiendo datos
    </span>
  );

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* ── Header de página ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Comunicaciones OPC UA / MQTT
          </h1>
          {connectionBadge}
        </div>
        <HomeButton />
      </div>

      {/* ── Filtros ISA-95 ──────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-[#F9F9FA] border-b border-slate-200">
        <div className="flex items-center gap-1 mb-1.5">
          <Filter className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
            Filtros ISA-95
          </span>
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({ site: "", area: "", line: "", cell: "", equipment_id: "" })}
              className="ml-2 text-[10px] text-[#29468B] hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
        <Filters
          filters={filters}
          setFilters={setFilters}
          sites={sites}
          areas={areas}
          lines={lines}
          cells={cells}
          equipments={equipments}
        />
      </div>

      {/* ── Contenido ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-3">
        {filtered.length > 0 ? (
          <>
            <div className="gauge-grid">{filtered.map(renderGaugeCard)}</div>
            <GatewayTable data={filtered} />
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-[12px] text-slate-400 font-medium">
            No hay datos para los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}
