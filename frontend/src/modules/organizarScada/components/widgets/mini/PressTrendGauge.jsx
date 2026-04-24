import React from "react";

export default function PressTrendGauge({
  value,
  unit,
  label = "press",
  trend = 0,
  primaryColor = "#00b894",
  textColor = "#fff",
}) {
  return (
    <div className="mini-gauge press-card" style={{ color: textColor }}>
      <div className="press-header">
        <span className="press-title">{label}</span>
        <span
          className="press-trend"
          style={{ color: trend >= 0 ? primaryColor : "red" }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
        </span>
      </div>

      <div className="press-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>

      <svg viewBox="0 0 120 40">
        <path
          d="M5 30 Q 40 10 70 20 T 115 15"
          stroke={primaryColor}
          fill="none"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}