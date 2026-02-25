import React, { useCallback, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import GaugeMeter from "@/modules/organizarScada/components/GaugeMeter";
import SvgGauge from "@/modules/organizarScada/components/SvgGauge";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import "@/styles/gateway.css";

// ==================== FUNCIONES DE UTILIDAD ====================

const parseNumericValue = (raw) => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const sanitized = raw.replace(",", ".");
    const parsed = Number(sanitized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const formatNumericValue = (value) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) {
    return null;
  }
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatValueWithDecimals = (value) => {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  const formatted = formatNumericValue(value);
  if (formatted !== null) {
    return formatted;
  }
  if (value === null || typeof value === "undefined") {
    return "-";
  }
  return String(value);
};

const normalizePercent = (value, min = 0, max = 100) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) {
    return 0;
  }
  if (min === max) {
    return 100;
  }
  const percent = ((numericValue - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, percent));
};

// ==================== COMPONENTES MINI-GAUGES ====================

const RingGauge = ({ percent, displayValue, unit }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="mini-gauge ring-gauge">
      <svg viewBox="0 0 140 140">
        <circle className="ring-track" cx="70" cy="70" r={radius}></circle>
        <circle
          className="ring-progress"
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        ></circle>
      </svg>
      <div className="ring-value">
        {displayValue}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
};

const MiniHorizontalBar = ({ percent, label }) => (
  <div className="mini-gauge horizontal-gauge">
    <div className="mini-bar-track">
      <div className="mini-bar-fill" style={{ width: `${percent}%` }}></div>
    </div>
    <div className="mini-bar-label">{label}</div>
  </div>
);

const BlueDonutGauge = ({ percent, label }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  return (
    <div className="mini-gauge donut-gauge">
      <svg viewBox="0 0 160 160">
        <circle className="donut-track" cx="80" cy="80" r={radius}></circle>
        <circle
          className="donut-progress"
          cx="80"
          cy="80"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        ></circle>
      </svg>
      <div className="donut-value">{label}</div>
    </div>
  );
};

const ValueBubble = ({ value, unit }) => (
  <div className="mini-gauge value-bubble">
    <div className="bubble-body">
      {value}
      {unit && <span>{unit}</span>}
    </div>
  </div>
);

const BooleanLamp = ({ active }) => (
  <div className="mini-gauge boolean-lamp">
    <div className={`lamp ${active ? "on" : "off"}`}></div>
    <div className="mini-bar-label">{active ? "OK" : "FALLO"}</div>
  </div>
);

const NeedleGauge = ({ percent, value, unit }) => {
  const center = 70;
  const radius = 58;
  const startAngle = -135;
  const endAngle = 135;
  const range = endAngle - startAngle;
  const arcEndAngle = startAngle + (range * percent) / 100;

  const toCartesian = (angle) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const polarArc = (start, end) => {
    const startPt = toCartesian(end);
    const endPt = toCartesian(start);
    const flag = end - start <= 180 ? "0" : "1";
    return `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${flag} 0 ${endPt.x} ${endPt.y}`;
  };

  const track = polarArc(startAngle, endAngle);
  const progress = percent <= 0 ? null : polarArc(startAngle, arcEndAngle);
  const pointer = toCartesian(arcEndAngle);

  return (
    <div className="mini-gauge needle-gauge">
      <svg viewBox="0 0 160 160" className="needle-svg">
        <path className="needle-track" d={track}></path>
        {progress && <path className="needle-progress" d={progress}></path>}
        <line
          x1={center}
          y1={center}
          x2={pointer.x}
          y2={pointer.y}
          className="needle-pointer"
        ></line>
        <circle
          cx={center}
          cy={center}
          r="6"
          className="needle-center"
        ></circle>
      </svg>
      <div className="needle-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
};

const KwShieldGauge = ({ value, unit, label }) => (
  <div className="mini-gauge kw-card">
    <div className="kw-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M10 10l1.8-3.2a.6.6 0 011.05 0L14 10h1.6a.4.4 0 01.32.64L14 13l1.92 2.36a.4.4 0 01-.32.64H14l-1.15 2.68a.6.6 0 01-1.1 0L10.6 16H9a.4.4 0 01-.32-.64L10.6 13 8.68 10.64A.4.4 0 019 10h1z"
          fill="#ffffff"
          opacity="0.85"
        />
      </svg>
    </div>
    <div className="kw-meta">
      <div className="kw-value-row">
        <div className="kw-value">{value}</div>
        <div className="kw-unit">{unit || "kW"}</div>
      </div>
      <div className="kw-label">{label || "power"}</div>
    </div>
  </div>
);

const PressTrendGauge = ({ value, unit, label = "press", trend = 0 }) => (
  <div className="mini-gauge press-card">
    <div className="press-header">
      <span className="press-title">{label}</span>
      <span className={`press-trend ${trend >= 0 ? "up" : "down"}`}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
      </span>
    </div>
    <div className="press-value">
      {value}
      {unit && <span>{unit}</span>}
    </div>
    <svg viewBox="0 0 120 40" className="press-chart">
      <path d="M5 30 Q 40 10 70 20 T 115 15" />
    </svg>
  </div>
);

const MiniTable = ({ rows = [] }) => (
  <div className="mini-table">
    <table>
      <thead>
        <tr>
          <th>Planta</th>
          <th>Equipo</th>
          <th>Variable</th>
          <th>Valor</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={5} className="empty-cell">
              Sin datos
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={`${row.variable}-${row.timestamp}-${idx}`}>
              <td>{row.site || "-"}</td>
              <td>{row.equipment || "-"}</td>
              <td>{row.variable || "-"}</td>
              <td>{row.value ?? "-"}</td>
              <td>{row.timestamp || "-"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const MiniTrendChart = ({ series = [] }) => {
  const width = 260;
  const height = 120;
  if (series.length === 0) {
    return <div className="mini-chart-empty">Sin datos</div>;
  }
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, idx) => {
      const x = (idx / (series.length - 1)) * (width - 20) + 10;
      const normalized = (value - min) / range;
      const y = height - 20 - normalized * (height - 40);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mini-chart">
      <polyline points={points} />
      {series.map((value, idx) => {
        const x = (idx / (series.length - 1)) * (width - 20) + 10;
        const normalized = (value - min) / range;
        const y = height - 20 - normalized * (height - 40);
        return <circle key={idx} cx={x} cy={y} r="3" />;
      })}
    </svg>
  );
};

// ==================== DRAGGABLE BOX COMPONENT ====================

export default function DraggableBox({
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  data,
  id,
  theme = "theme-clean",
  onSelect,
  onDragStop,
  onResizeStop,
  onDelete,
  isReadOnly = false,
}) {
  if (!data) return null;

  // Estado local para Rnd, importado de la rama develop
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const { allTags } = useRealtimeData();
  const [valueHistory, setValueHistory] = useState([]);

  // Sincronizar el estado interno con las props iniciales
  useEffect(() => {
    setX(initialX);
    setY(initialY);
    setWidth(initialWidth);
    setHeight(initialHeight);
  }, [initialX, initialY, initialWidth, initialHeight]);

  const handleDragStop = (_e, d) => {
    setX(d.x);
    setY(d.y);
    onDragStop(id, d.x, d.y);
  };

  const handleResizeStop = (_e, _dir, ref, _delta, pos) => {
    const newW = parseInt(ref.style.width, 10);
    const newH = parseInt(ref.style.height, 10);
    setWidth(newW);
    setHeight(newH);
    setX(pos.x);
    setY(pos.y);
    onResizeStop(id, newW, newH, pos.x, pos.y);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const resolveLive = useCallback(() => {
    const settings = data.settings || {};
    const eq = settings.equipment || data.equipment;
    const variable =
      settings.variable || settings.attributeKey || data.variable;
    const site = settings.site;
    const area = settings.area;
    const line = settings.line;
    const cell = settings.cell;

    if (!eq || !variable) return { value: undefined, unit: settings.unit };

    const candidate =
      allTags.find(
        (t) =>
          t.equipment === eq &&
          t.variable === variable &&
          (!site || t.site === site) &&
          (!area || t.area === area) &&
          (!line || t.line === line) &&
          (!cell || t.cell === cell)
      ) || allTags.find((t) => t.equipment === eq && t.variable === variable);

    return {
      value: candidate?.value,
      unit: candidate?.unit || settings.unit,
      site: candidate?.site || site,
      area: candidate?.area || area,
      line: candidate?.line || line,
      cell: candidate?.cell || cell,
      equipment: candidate?.equipment || eq,
      variable: candidate?.variable || variable,
      timestamp: candidate?.timestamp,
    };
  }, [allTags, data.settings, data.equipment, data.variable]);

  useEffect(() => {
    const resolved = resolveLive();
    if (typeof resolved.value === "undefined") return;
    const timestamp = resolved.timestamp || new Date().toISOString();
    setValueHistory((prev) => {
      const last = prev.at(-1);
      // Se corrige la condición duplicada
      if (
        last &&
        last.timestamp === timestamp &&
        last.value === resolved.value
      ) {
        return prev;
      }
      const entry = {
        ...resolved,
        timestamp,
        displayValue: formatValueWithDecimals(resolved.value),
        numericValue: parseNumericValue(resolved.value),
      };
      const next = [...prev, entry];
      return next.slice(-20);
    });
  }, [resolveLive]);

  const buildNumericMiniProps = (settings, liveData) => {
    const min =
      typeof settings.minValue !== "undefined" ? settings.minValue : 0;
    const max =
      typeof settings.maxValue !== "undefined" ? settings.maxValue : 100;
    const rawValue =
      typeof liveData.value !== "undefined"
        ? liveData.value
        : settings.initialValue;
    const numericValue = parseNumericValue(rawValue);
    // Se corrige la línea duplicada y se deja la versión más compacta
    const fallbackNumeric =
      numericValue ?? parseNumericValue(settings.initialValue) ?? 0;
    const percent = normalizePercent(fallbackNumeric, min, max);
    const formattedValue = formatNumericValue(fallbackNumeric) ?? "-";
    const labelText =
      formattedValue === "-"
        ? "-"
        : liveData.unit
        ? `${formattedValue} ${liveData.unit}`
        : formattedValue;
    const bubbleValue = formatValueWithDecimals(rawValue);
    return {
      percent,
      formattedValue,
      labelText,
      bubbleValue,
      unit: liveData.unit,
    };
  };

  const live = resolveLive();
  const equipmentName =
    live.equipment ||
    data.settings?.equipment ||
    data.equipment ||
    "Sin equipo";

  const renderContent = () => {
    const settings = data.settings || {};

    switch (data.type) {
      case "speedometer":
      case "temperature-gauge": {
        const isThermo = data.type === "temperature-gauge";
        // Uso de `width` y `height` del estado local (rama develop)
        return (
          <div className="w-full h-full flex flex-col items-center">
            <GaugeMeter
              initialValue={
                typeof live.value !== "undefined"
                  ? live.value
                  : settings.initialValue ?? 0
              }
              minValue={
                typeof settings.minValue !== "undefined" ? settings.minValue : 0
              }
              maxValue={
                typeof settings.maxValue !== "undefined"
                  ? settings.maxValue
                  : 100
              }
              label={settings.attributeLabel || data.label}
              unit={live.unit}
              showInput={false}
              showScroll={false}
              width={width - 20}
              height={height - 50}
              theme={theme}
              isThermometer={isThermo}
            />
          </div>
        );
      }
      case "mini-ring":
      case "mini-horizontal":
      case "mini-donut":
      case "mini-bubble": {
        const label = settings.attributeLabel || data.label;
        const numericProps = buildNumericMiniProps(settings, live);
        const content =
          data.type === "mini-horizontal" ? (
            <MiniHorizontalBar
              percent={numericProps.percent}
              label={numericProps.labelText}
            />
          ) : data.type === "mini-donut" ? (
            <BlueDonutGauge
              percent={numericProps.percent}
              label={numericProps.labelText}
            />
          ) : data.type === "mini-bubble" ? (
            <ValueBubble
              value={numericProps.bubbleValue}
              unit={numericProps.unit}
            />
          ) : (
            <RingGauge
              percent={numericProps.percent}
              displayValue={numericProps.formattedValue}
              unit={numericProps.unit}
            />
          );
        return (
          <div className="scada-mini-widget">
            <div className="scada-mini-title">{label}</div>
            {content}
          </div>
        );
      }
      case "mini-needle": {
        const label = settings.attributeLabel || data.label;
        const numericProps = buildNumericMiniProps(settings, live);
        return (
          <div className="scada-mini-widget">
            <div className="scada-mini-title">{label}</div>
            <NeedleGauge
              percent={numericProps.percent}
              value={numericProps.formattedValue}
              unit={numericProps.unit}
            />
          </div>
        );
      }
      case "power-card": {
        const label = settings.attributeLabel || data.label;
        const numericProps = buildNumericMiniProps(settings, live);
        // Se deja la sintaxis más compacta de develop
        return (
          <KwShieldGauge
            value={numericProps.formattedValue}
            unit={numericProps.unit}
            label={label}
          />
        );
      }
      case "press-card": {
        const label = settings.attributeLabel || data.label;
        const numericProps = buildNumericMiniProps(settings, live);
        return (
          <PressTrendGauge
            value={numericProps.formattedValue}
            unit={numericProps.unit}
            label={label}
            trend={numericProps.percent - 50}
          />
        );
      }
      case "mini-lamp": {
        const label = settings.attributeLabel || data.label;
        const boolValue =
          typeof live.value === "boolean"
            ? live.value
            : // Se deja la sintaxis más compacta de develop
              Boolean(
                typeof settings.initialValue !== "undefined"
                  ? settings.initialValue
                  : false
              );
        return (
          <div className="scada-mini-widget">
            <div className="scada-mini-title">{label}</div>
            <BooleanLamp active={boolValue} />
          </div>
        );
      }
      case "mini-table": {
        const label = settings.attributeLabel || data.label;
        const fallbackRow =
          typeof live.value !== "undefined"
            ? [
                {
                  site: live.site || settings.site,
                  equipment: live.equipment || settings.equipment,
                  variable:
                    live.variable || settings.attributeKey || data.label,
                  value: formatValueWithDecimals(live.value),
                  timestamp: live.timestamp || new Date().toISOString(),
                },
              ]
            : [];
        const tableRows = valueHistory.length
          ? [...valueHistory]
              .slice(-10)
              .reverse()
              .map((entry) => ({
                site: entry.site || settings.site,
                equipment: entry.equipment || settings.equipment,
                variable: entry.variable || settings.attributeKey || data.label,
                value:
                  entry.displayValue ?? formatValueWithDecimals(entry.value),
                timestamp: entry.timestamp,
              }))
          : settings.rows || fallbackRow;
        return (
          <div className="scada-mini-widget">
            <div className="scada-mini-title">{label}</div>
            <MiniTable rows={tableRows} />
          </div>
        );
      }
      case "mini-chart": {
        const label = settings.attributeLabel || data.label;
        const historySeries = valueHistory
          .map((entry) => entry.numericValue)
          .filter((val) => typeof val === "number");
        const fallbackSeries =
          typeof live.value !== "undefined"
            ? [parseNumericValue(live.value)].filter(
                (val) => typeof val === "number"
              )
            : settings.series || [];
        const series =
          historySeries.length >= 2 ? historySeries : fallbackSeries;
        return (
          <div className="scada-mini-widget">
            <div className="scada-mini-title">{label}</div>
            <MiniTrendChart series={series} />
          </div>
        );
      }
      case "svg-gauge": {
        const valueToRender =
          typeof live.value !== "undefined"
            ? live.value
            : data.gaugeOptions?.value ?? 0;
        // Uso de `width` y `height` del estado local (rama develop)
        return (
          <SvgGauge
            options={data.gaugeOptions}
            value={valueToRender}
            className={data.className}
            width={width}
            height={height}
          />
        );
      }
      case "nav-button": {
        const label = data.label || "Boton";
        const variantClass =
          data.variant === "btn-outline"
            ? "border border-sky-500 text-sky-700 hover:bg-sky-50"
            : "bg-sky-600 hover:bg-sky-700 text-white";
        // En el editor (DraggableBox), el botón NO debe navegar.
        // Solo renderizamos su apariencia.
        return (
          <button
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition cursor-default ${variantClass}`}
            onClick={(e) => e.preventDefault()} // Evitar cualquier acción por defecto
            title="Botón de navegación (activo solo en Producción)"
          >
            {label}
            {data.targetViewId && (
              <span className="ml-2 inline-flex items-center rounded bg-white/20 px-2 py-0.5 text-[10px] font-normal">
                {data.targetViewId}
              </span>
            )}
          </button>
        );
      }
      case "label-pill": {
        const label = data.label || "Label";
        return (
          <div className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs px-3 py-0.5 border border-emerald-100">
            {label}
          </div>
        );
      }
      case "label-badge": {
        const label = data.label || "Badge";
        return (
          <div className="inline-flex items-center rounded bg-slate-800 text-slate-50 text-[10px] px-2 py-0.5 uppercase tracking-wide">
            {label}
          </div>
        );
      }
      case "card-soft":
      case "card-elevated": {
        const label = data.label || "Caja";
        const elevated = data.type === "card-elevated";
        return (
          <div
            className={[
              "w-full h-full rounded-lg border px-3 py-2 text-slate-700 text-sm flex items-center",
              elevated ? "bg-white shadow-md" : "bg-slate-50 shadow-sm",
            ].join(" ")}
          >
            {label}
          </div>
        );
      }
      default:
        return (
          <div className="p-2 text-gray-600">Componente: {data.label}</div>
        );
    }
  };

  // Contenido del widget (unificado desde la rama develop)
  const WidgetContent = (
    <div className="relative flex flex-col h-full w-full">
      {/* Header con botón de eliminar, solo visible si NO es isReadOnly */}
      {!isReadOnly && (
        <div className="box-header flex justify-between items-center p-2 border-b border-gray-200 cursor-grab active:cursor-grabbing">
          <span className="font-semibold text-sm text-gray-700">
            {data.settings?.attributeLabel || data.label}
          </span>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center w-5 h-5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 text-lg font-bold"
            aria-label="Eliminar componente"
          >
            &times;
          </button>
        </div>
      )}
      {/* Contenido principal del componente */}
      <div className="flex-grow p-2 overflow-hidden flex items-center justify-center">
        {renderContent()}
      </div>
      {/* Footer y badges */}
      <div className="component-equipment-label">Equipo: {equipmentName}</div>
      {typeof live.value === "undefined" && (
        <div className="component-no-data-badge">Sin datos</div>
      )}
    </div>
  );

  // Renderizado en modo solo lectura (fijo, sin Rnd)
  if (isReadOnly) {
    return (
      <div
        className="bg-white rounded-lg shadow-lg border border-gray-200 absolute"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          // Usamos el estado local x, y para la posición
          transform: `translate(${x}px, ${y}px)`,
          pointerEvents: "none",
        }}
      >
        {WidgetContent}
      </div>
    );
  }

  // Renderizado en modo editable (con Rnd)
  return (
    <Rnd
      className="bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer"
      // Usamos el estado local para size y position
      size={{ width: width, height: height }}
      position={{ x: x, y: y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={
        data.type === "speedometer" || data.type === "temperature-gauge"
          ? 120
          : 50
      }
      minHeight={
        data.type === "speedometer" || data.type === "temperature-gauge"
          ? 150
          : 50
      }
      dragHandleClassName="box-header"
      resizeHandleClasses={{ bottomRight: "resize-handle-br" }}
      onClick={() => onSelect?.()}
    >
      {WidgetContent}
    </Rnd>
  );
}
