import React, { useMemo } from "react";

export default function TemperatureLineChart({
  label = "Temp C",
  series = [],
  yMin = 0,
  yMax = 100,

  // 👇 VIENE DEL REGISTRY
  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) {
  const safeSeries = useMemo(() => {
    if (Array.isArray(series) && series.length >= 2) return series;
    return [22, 34, 41, 36, 48, 53, 49, 58, 62];
  }, [series]);

  const minVal = Number.isFinite(Number(yMin)) ? Number(yMin) : 0;
  const maxVal = Number.isFinite(Number(yMax)) ? Number(yMax) : 100;
  const safeRange = Math.max(1, maxVal - minVal);

  const xStart = 50;
  const xEnd = 370;
  const yTop = 20;
  const yBottom = 200;
  const stepX = (xEnd - xStart) / (safeSeries.length - 1);

  const points = safeSeries.map((value, idx) => {
    const normalized = (Number(value) - minVal) / safeRange;
    const x = xEnd - idx * stepX;
    const y =
      yBottom -
      Math.max(0, Math.min(1, normalized)) * (yBottom - yTop);
    return { x, y, value };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const selected = points[0];
  const selectedLabel = `${Math.round(Number(selected?.value || 0))}°C`;

  return (
    <svg height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* 🔥 BACKGROUND DINÁMICO */}
      <rect x="0" y="0" width="400" height="250" fill={backgroundColor} rx="8" />

      {/* AXES */}
      <line x1="50" y1="20" x2="50" y2="200" stroke={axisColor} strokeWidth="1" />
      <line x1="50" y1="200" x2="380" y2="200" stroke={axisColor} strokeWidth="1" />

      {/* Y LABELS */}
      <g fontFamily="Arial" fontSize="10" fill={textColor} textAnchor="end">
        <text x="40" y="20">{Math.round(maxVal)}</text>
        <text x="40" y="65">{Math.round(maxVal - safeRange * 0.25)}</text>
        <text x="40" y="110">{Math.round(maxVal - safeRange * 0.5)}</text>
        <text x="40" y="155">{Math.round(maxVal - safeRange * 0.75)}</text>
        <text x="40" y="200">{Math.round(minVal)}</text>
      </g>

      {/* AXIS LABEL */}
      <text
        x="25"
        y="110"
        fontFamily="Arial"
        fontSize="10"
        fill={textColor}
        transform="rotate(-90 25 110)"
      >
        VALOR
      </text>

      {/* GRID */}
      <g stroke={gridColor} strokeWidth="0.5" strokeDasharray="2,2">
        <line x1="50" y1="65" x2="380" y2="65" />
        <line x1="50" y1="110" x2="380" y2="110" />
        <line x1="50" y1="155" x2="380" y2="155" />
      </g>

      {/* 🔥 LINEA PRINCIPAL */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 🔥 PUNTO ACTIVO */}
      {selected && (
        <>
          <circle
            cx={selected.x}
            cy={selected.y}
            r="6"
            fill={secondaryColor}
            stroke={textColor}
            strokeWidth="2"
          />
          <text
            x={selected.x + 8}
            y={Math.max(14, selected.y - 10)}
            fontFamily="Arial"
            fontSize="10"
            fill={textColor}
          >
            {selectedLabel}
          </text>
        </>
      )}

      {/* LEGEND */}
      <rect x="300" y="10" width="70" height="15" fill={gridColor} rx="3" />
      <circle cx="310" cy="17" r="3" fill={primaryColor} />
      <text x="320" y="20" fontFamily="Arial" fontSize="10" fill={textColor}>
        {label}
      </text>
    </svg>
  );
}