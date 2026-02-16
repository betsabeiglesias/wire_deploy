import React, { useMemo } from "react";

// Utilidad para trazar arcos (usado por hmi-scada-gauge)
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(toRad(startDeg)),
    y: cy + r * Math.sin(toRad(startDeg)),
  };
  const end = {
    x: cx + r * Math.cos(toRad(endDeg)),
    y: cy + r * Math.sin(toRad(endDeg)),
  };
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const NavButton = ({ width, height, label, fill = "#0ea5e9", textColor = "#ffffff" }) => (
  <g>
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      rx={8}
      fill={fill}
      stroke="#0ea5e9"
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
    />
    <text
      x={width / 2}
      y={height / 2}
      fill={textColor}
      fontFamily="Inter, Arial, sans-serif"
      fontSize={Math.max(12, Math.min(16, width * 0.12))}
      fontWeight="600"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {label}
    </text>
  </g>
);

const MiniTable = ({ width, height, rows = [] }) => {
  const rowHeight = 20;
  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {rows.map((row, idx) => {
        const y = 8 + idx * rowHeight;
        return (
          <g key={idx} transform={`translate(8, ${y})`}>
            <text
              x={0}
              y={0}
              fill="#0f172a"
              fontFamily="Inter, Arial, sans-serif"
              fontSize={11}
              dominantBaseline="hanging"
            >
              {row.variable ?? row.label ?? `Row ${idx + 1}`}
            </text>
            <text
              x={width - 24}
              y={0}
              fill="#475569"
              fontFamily="Inter, Arial, sans-serif"
              fontSize={11}
              textAnchor="end"
              dominantBaseline="hanging"
            >
              {row.value ?? row.displayValue ?? "-"}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const ScadaGauge = ({ width, height, settings = {} }) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  const start = 210;
  const end = -30;
  const zones = settings.zones || [];
  const value = settings.initialValue ?? 0;
  const min = settings.min ?? 0;
  const max = settings.max ?? 100;
  const norm = (val) => Math.max(0, Math.min(1, (val - min) / (max - min)));
  const valueAngle = start + (end - start) * norm(value);

  return (
    <g strokeLinecap="round">
      {/* fondo */}
      <path
        d={arcPath(cx, cy, radius, start, end)}
        stroke="#e2e8f0"
        strokeWidth={10}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {/* zonas */}
      {zones.map((z, idx) => {
        const a1 = start + (end - start) * norm(z.start);
        const a2 = start + (end - start) * norm(z.end);
        return (
          <path
            key={idx}
            d={arcPath(cx, cy, radius, a1, a2)}
            stroke={z.color || "#22c55e"}
            strokeWidth={10}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {/* valor */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (radius - 6) * Math.cos((Math.PI / 180) * valueAngle)}
        y2={cy + (radius - 6) * Math.sin((Math.PI / 180) * valueAngle)}
        stroke={settings.themeColor || "#0ea5e9"}
        strokeWidth={4}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={cx} cy={cy} r={6} fill="#0f172a" />
      <text
        x={cx}
        y={cy + 18}
        fontFamily="Inter, Arial, sans-serif"
        fontSize={14}
        fontWeight="700"
        textAnchor="middle"
        fill="#0f172a"
      >
        {settings.label || "Gauge"}
      </text>
      <text
        x={cx}
        y={cy + 34}
        fontFamily="Inter, Arial, sans-serif"
        fontSize={12}
        textAnchor="middle"
        fill="#334155"
      >
        {`${value}${settings.unit ? ` ${settings.unit}` : ""}`}
      </text>
    </g>
  );
};

const ScadaRenderer = ({ elements = [], onSelect, selectedId }) => {
  const renderElement = (el) => {
    const { data = {}, x = 0, y = 0, id } = el;
    const { type, width = 200, height = 120, settings = {} } = data;

    // hit-area grande para selección
    const hitArea = (
      <rect
        width={width}
        height={height}
        fill="transparent"
        pointerEvents="all"
      />
    );

    if (type === "nav-button") {
      return (
        <g
          key={id}
          id={id}
          className={`scada-widget-group ${selectedId === id ? "selected" : ""}`}
          transform={`translate(${x}, ${y})`}
          onClick={() => onSelect?.(id)}
          style={{ cursor: "move", pointerEvents: "all" }}
        >
          {hitArea}
          <NavButton
            width={width}
            height={height}
            label={data.label || "Button"}
            fill={settings.fill}
            textColor={settings.textColor}
          />
        </g>
      );
    }

    if (type === "mini-table") {
      const rows = settings.rows || [];
      return (
        <g
          key={id}
          id={id}
          className={`scada-widget-group ${selectedId === id ? "selected" : ""}`}
          transform={`translate(${x}, ${y})`}
          onClick={() => onSelect?.(id)}
          style={{ cursor: "move", pointerEvents: "all" }}
        >
          {hitArea}
          <MiniTable width={width} height={height} rows={rows} />
        </g>
      );
    }

    if (type === "hmi-scada-gauge") {
      return (
        <g
          key={id}
          id={id}
          className={`scada-widget-group ${selectedId === id ? "selected" : ""}`}
          transform={`translate(${x}, ${y})`}
          onClick={() => onSelect?.(id)}
          style={{ cursor: "move", pointerEvents: "all" }}
        >
          {hitArea}
          <ScadaGauge width={width} height={height} settings={settings} />
        </g>
      );
    }

    if (settings.svgContent) {
      return (
        <g
          key={id}
          id={id}
          className={`scada-widget-group ${selectedId === id ? "selected" : ""}`}
          transform={`translate(${x}, ${y})`}
          onClick={() => onSelect?.(id)}
          style={{ cursor: "move", pointerEvents: "all" }}
        >
          {hitArea}
          <g
            dangerouslySetInnerHTML={{ __html: settings.svgContent }}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      );
    }

    // fallback: marco vacío
    return (
      <g
        key={id}
        id={id}
        className={`scada-widget-group ${selectedId === id ? "selected" : ""}`}
        transform={`translate(${x}, ${y})`}
        onClick={() => onSelect?.(id)}
        style={{ cursor: "move", pointerEvents: "all" }}
      >
        {hitArea}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="rgba(14,165,233,0.08)"
          stroke="#38bdf8"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  };

  const rendered = useMemo(() => elements.map(renderElement), [elements, selectedId]);

  return <g>{rendered}</g>;
};

export default ScadaRenderer;
