import React, { useMemo } from "react";

export default function TemperatureLineChart({
  label = "Temp C",
  series = [],
  yMin = 0,
  yMax = 100,
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

  const points = safeSeries
    .map((value, idx) => {
      const normalized = (Number(value) - minVal) / safeRange;
      const x = xEnd - idx * stepX;
      const y = yBottom - Math.max(0, Math.min(1, normalized)) * (yBottom - yTop);
      return { x, y, value };
    });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const selected = points[0];
  const selectedLabel = `${Math.round(Number(selected?.value || 0))}°C`;

  return (
    <svg height="250" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="400" height="250" fill="#2d3436" rx="8" />

      <line x1="50" y1="20" x2="50" y2="200" stroke="#636e72" strokeWidth="1" />
      <line x1="50" y1="200" x2="380" y2="200" stroke="#636e72" strokeWidth="1" />

      <g fontFamily="Arial" fontSize="10" fill="#b2bec3" textAnchor="end">
        <text x="40" y="20">
          {Math.round(maxVal)}
        </text>
        <text x="40" y="65">
          {Math.round(maxVal - safeRange * 0.25)}
        </text>
        <text x="40" y="110">
          {Math.round(maxVal - safeRange * 0.5)}
        </text>
        <text x="40" y="155">
          {Math.round(maxVal - safeRange * 0.75)}
        </text>
        <text x="40" y="200">
          {Math.round(minVal)}
        </text>
      </g>

      <text
        x="25"
        y="110"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        transform="rotate(-90 25 110)"
      >
        VALOR
      </text>

      <g stroke="#485460" strokeWidth="0.5" strokeDasharray="2,2">
        <line x1="50" y1="65" x2="380" y2="65" />
        <line x1="50" y1="110" x2="380" y2="110" />
        <line x1="50" y1="155" x2="380" y2="155" />
      </g>

      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#00b894"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {selected && (
        <>
          <circle
            cx={selected.x}
            cy={selected.y}
            r="6"
            fill="#00d2d3"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={selected.x + 8}
            y={Math.max(14, selected.y - 10)}
            fontFamily="Arial"
            fontSize="10"
            fill="#ffffff"
          >
            {selectedLabel}
          </text>
        </>
      )}

      <rect x="300" y="10" width="70" height="15" fill="#485460" rx="3" />
      <circle cx="310" cy="17" r="3" fill="#00b894" />
      <text x="320" y="20" fontFamily="Arial" fontSize="10" fill="#b2bec3">
        {label}
      </text>
    </svg>
  );
}
