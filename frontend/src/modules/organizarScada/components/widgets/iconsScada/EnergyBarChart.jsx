import React, { useMemo } from "react";

export default function EnergyBarChart({
  title = "CONSUMO ENERGETICO (kW)",
  valueText = "420 kW",
  width = 400,
  height = 250,
  bgColor = "#1e272e",
  gridColor = "#2f3640",
  axisColor = "#57606f",
  titleColor = "#ecf0f1",
  valueColor = "#00d2d3",
  labelColor = "#95a5a6",
  barGradientFrom = "#00d2d3",
  barGradientTo = "#0984e3",
  alertBarColor = "#ff7675",
  limitColor = "#d63031",
  showGrid = true,
  showLimit = true,
  showTitle = true,
  showValue = true,
  bars = [],
  xLabels = [],
  maxValue,
  limitValue = 1250,
}) {
  const barsData = useMemo(() => {
    if (Array.isArray(bars) && bars.length > 0) return bars;
    return [760, 980, 640, 1220, 860, 710];
  }, [bars]);

  const labelsData = useMemo(() => {
    if (Array.isArray(xLabels) && xLabels.length === barsData.length) return xLabels;
    return ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].slice(
      0,
      barsData.length,
    );
  }, [xLabels, barsData]);

  const yBase = 180;
  const yTop = 50;
  const chartHeight = yBase - yTop;
  const maxScale = Math.max(maxValue || 0, ...barsData, limitValue || 0, 1000);
  const step = 50;
  const barWidth = 35;
  const startX = 65;
  const alertIdx = barsData.indexOf(Math.max(...barsData));

  return (
    <svg width={width} height={height} viewBox="0 0 400 250">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={barGradientFrom} />
          <stop offset="100%" stopColor={barGradientTo} />
        </linearGradient>
      </defs>

      {/* Fondo */}
      <rect width="400" height="250" fill={bgColor} rx="10" />

      {/* Título */}
      {showTitle && (
        <text x="20" y="30" fontSize="14" fill={titleColor}>
          {title}
        </text>
      )}

      {/* Grid */}
      {showGrid && (
        <>
          <line x1="50" y1="60" x2="370" y2="60" stroke={gridColor} />
          <line x1="50" y1="100" x2="370" y2="100" stroke={gridColor} />
          <line x1="50" y1="140" x2="370" y2="140" stroke={gridColor} />
          <line x1="50" y1="180" x2="370" y2="180" stroke={axisColor} />
        </>
      )}

      {/* Barras */}
      {barsData.map((barValue, idx) => {
        const normalized = Math.max(0, Math.min(1, barValue / maxScale));
        const barHeight = Math.max(4, normalized * chartHeight);
        const y = yBase - barHeight;
        const x = startX + idx * step;

        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="url(#barGradient)"
            rx="2"
          />
        );
      })}

      {/* Labels */}
      <g fontSize="10" fill={labelColor} textAnchor="middle">
        {labelsData.map((lbl, idx) => (
          <text key={idx} x={startX + idx * step + barWidth / 2} y="220">
            {lbl}
          </text>
        ))}
      </g>
    </svg>
  );
}
