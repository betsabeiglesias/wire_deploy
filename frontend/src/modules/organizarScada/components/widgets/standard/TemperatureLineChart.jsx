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

  const points = safeSeries.map((value, idx) => {
    const normalized = (Number(value) - minVal) / safeRange;
    const x = xEnd - idx * stepX;
    const y = yBottom - Math.max(0, Math.min(1, normalized)) * (yBottom - yTop);
    return { x, y, value };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const selected = points[0];
  const selectedLabel = `${Math.round(Number(selected?.value || 0))}°C`;

  return (
    <svg height="250" viewBox="0 0 400 250">
      <rect x="0" y="0" width="400" height="250" fill="#2d3436" rx="8" />

      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#00b894"
        strokeWidth="3"
      />

      {selected && (
        <>
          <circle cx={selected.x} cy={selected.y} r="6" fill="#00d2d3" />
          <text x={selected.x + 8} y={selected.y - 10} fill="#fff">
            {selectedLabel}
          </text>
        </>
      )}
    </svg>
  );
}