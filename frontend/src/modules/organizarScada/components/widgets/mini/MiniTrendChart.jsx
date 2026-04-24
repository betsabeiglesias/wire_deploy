import React from "react";

export default function MiniTrendChart({ series = [], primaryColor = "#00b894" }) {
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
      <polyline
        points={points}
        fill="none"
        stroke={primaryColor}
        strokeWidth="2"
      />
      {series.map((value, idx) => {
        const x = (idx / (series.length - 1)) * (width - 20) + 10;
        const normalized = (value - min) / range;
        const y = height - 20 - normalized * (height - 40);
        return <circle key={idx} cx={x} cy={y} r="3" fill={primaryColor} />;
      })}
    </svg>
  );
}