// frontend/src/modules/scada/pages/Communications.jsx

import "@/styles/gateway.css";
import { useState, useMemo } from "react";
import { parseNumericValue, formatNumericValue, clampPercent } from "../utils";

// Gauges
import { RingGauge } from "../components/gauges/RingGauge";
import { MiniHorizontalBar } from "../components/gauges/MiniHorizontalBar";
import { ValueBubble } from "../components/gauges/ValueBubble";
import { BooleanLamp } from "../components/gauges/BooleanLamp";
import { KwShieldGauge } from "../components/gauges/KwShieldGauge";
import { PressTrendGauge } from "../components/gauges/PressTrendGauge";
import { BlueDonutGauge } from "../components/gauges/BlueDonutGauge";
import { NeedleGauge } from "../components/gauges/NeedleGauge";

// Otros componentes
import { Filters } from "../components/Filters";
import { GatewayTable } from "../components/GatewayTable";
import Button from "../../../components/Button";

import { useRealtime } from "@/context/RealtimeProvider";
import HomeButton from "../../../components/HomeButton";

export default function Communications() {
  
  const { connected, dataStale, allTags } = useRealtime();

  // ✔ Cambiado: ahora usamos equipment_id
  const [filters, setFilters] = useState({ 
    site: "", 
    area: "", 
    line: "", 
    cell: "", 
    equipment_id: "" 
  });

  // ---------------------------
  // FILTROS ISA-95
  // ---------------------------

  const sites = useMemo(
    () => [...new Set(allTags.map((t) => t.site))],
    [allTags]
  );

  const areas = useMemo(
    () =>
      [...new Set(
        allTags
          .filter((t) => !filters.site || t.site === filters.site)
          .map((t) => t.area)
      )],
    [allTags, filters.site]
  );

  const lines = useMemo(
    () =>
      [...new Set(
        allTags
          .filter(
            (t) =>
              (!filters.site || t.site === filters.site) &&
              (!filters.area || t.area === filters.area)
          )
          .map((t) => t.line)
      )],
    [allTags, filters.site, filters.area]
  );

  const cells = useMemo(
    () =>
      [...new Set(
        allTags
          .filter(
            (t) =>
              (!filters.site || t.site === filters.site) &&
              (!filters.area || t.area === filters.area) &&
              (!filters.line || t.line === filters.line)
          )
          .map((t) => t.cell)
      )],
    [allTags, filters.site, filters.area, filters.line]
  );

  // ✔ Cambiado: lista de equipos usando equipment_id
  const equipments = useMemo(
    () =>
      [...new Set(
        allTags
          .filter(
            (t) =>
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
      allTags.filter(
        (t) =>
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

    // ✔ Cambiado: ahora siempre usamos equipment_id
    const equipmentLabel = tag.equipment_id || "Equipo sin identificar";

    if (value === null || typeof value === "undefined") return null;

    // ---------- BOOLEAN ----------
    if (typeof value === "boolean") {
      return (
        <div key={`boolean-${index}`} className="mini-card">
          <div className="mini-title">{variable}</div>
          <BooleanLamp active={value} />
          <div className="mini-equipment-label" title={equipmentLabel}>
            {equipmentLabel}
          </div>
        </div>
      );
    }

    // ---------- NUMÉRICOS ----------
    const numericValue = parseNumericValue(value);

    if (numericValue !== null) {
      const variableKey = typeof variable === "string" ? variable.toLowerCase() : "";

      const variant =
        variableKey.includes("power")
          ? "kw-card"
          : variableKey.includes("press")
          ? "press-card"
          : numericVariants[numericVariantIndex++ % numericVariants.length];

      const percent = clampPercent(numericValue);
      const displayValue = formatNumericValue(numericValue) ?? "-";
      const labelText = unit ? `${displayValue} ${unit}` : displayValue;

      const gaugeContent =
        {
          ring: <RingGauge percent={percent} displayValue={displayValue} unit={unit} />,
          horizontal: <MiniHorizontalBar percent={percent} label={labelText} />,
          donut: <BlueDonutGauge percent={percent} label={labelText} />,
          needle: <NeedleGauge percent={percent} value={displayValue} unit={unit} />,
          "kw-card": <KwShieldGauge value={displayValue} unit={unit || "power"} label={variable} />,
          "press-card": (
            <PressTrendGauge
              value={displayValue}
              unit={unit}
              label={variable}
              trend={(percent ?? 0) - 50}
            />
          ),
          bubble: <ValueBubble value={displayValue} unit={unit} />,
        }[variant] ||
        <RingGauge percent={percent} displayValue={displayValue} unit={unit} />;

      return (
        <div key={`numeric-${index}`} className="mini-card">
          <div className="mini-title">{variable}</div>
          {gaugeContent}
          <div className="mini-equipment-label" title={equipmentLabel}>
            {equipmentLabel}
          </div>
        </div>
      );
    }

    // ---------- STRING ----------
    return (
      <div key={`string-${index}`} className="mini-card">
        <div className="mini-title">{variable}</div>
        <ValueBubble value={String(value)} />
        <div className="mini-equipment-label" title={equipmentLabel}>
          {equipmentLabel}
        </div>
      </div>
    );
  };

  // ---------------------------
  // RENDER
  // ---------------------------

  return (
    <div className="gateway-container w-full">
      {/* Aseguramos que el contenedor sea relativo y ocupe todo el ancho 
          para que el botón 'absolute' se pegue al borde derecho de la pantalla
      */}
      <div className="relative mb-4 w-full flex items-center justify-start">
        <div className="absolute right-0 top-0">
          <HomeButton/>
        </div>
      </div>

      <h2 className="gateway-title">Comunicaciones OPC UA / MQTT</h2>

      <div className="gateway-status">
        {!connected && <span style={{ color: "red" }}>🔴 Desconectado de MQTT</span>}
        {connected && dataStale && (
          <span style={{ color: "orange" }}>🟡 Conectado — sin datos (PLC offline)</span>
        )}
        {connected && !dataStale && (
          <span style={{ color: "green" }}>🟢 Conectado — recibiendo datos</span>
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

      {filtered.length > 0 ? (
        <div className="gauge-grid">{filtered.map(renderGaugeCard)}</div>
      ) : (
        <div className="gauge-empty">No hay datos para los filtros seleccionados</div>
      )}

      <GatewayTable data={filtered} />
    </div>
  );
}
