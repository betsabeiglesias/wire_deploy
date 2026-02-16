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
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: barGradientFrom, stopOpacity: 1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: barGradientTo, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="250" fill={bgColor} rx="10" />

      {showTitle && (
        <text
          x="20"
          y="30"
          fontFamily="Arial"
          fontSize="14"
          fontWeight="bold"
          fill={titleColor}
        >
          {title}
        </text>
      )}

      <g fontFamily="Arial" fontSize="10" fill={labelColor} textAnchor="end">
        <text x="40" y="60">
          {Math.round(maxScale)}
        </text>
        <text x="40" y="100">
          {Math.round(maxScale * 0.66)}
        </text>
        <text x="40" y="140">
          {Math.round(maxScale * 0.33)}
        </text>
        <text x="40" y="180">
          0
        </text>
      </g>

      {showGrid && (
        <>
          <line x1="50" y1="60" x2="370" y2="60" stroke={gridColor} strokeWidth="1" />
          <line x1="50" y1="100" x2="370" y2="100" stroke={gridColor} strokeWidth="1" />
          <line x1="50" y1="140" x2="370" y2="140" stroke={gridColor} strokeWidth="1" />
          <line x1="50" y1="180" x2="370" y2="180" stroke={axisColor} strokeWidth="2" />
        </>
      )}

      {barsData.map((barValue, idx) => {
        const normalized = Math.max(0, Math.min(1, barValue / maxScale));
        const barHeight = Math.max(4, normalized * chartHeight);
        const y = yBase - barHeight;
        const x = startX + idx * step;
        const fill = idx === alertIdx ? alertBarColor : "url(#barGradient)";
        return (
          <rect key={`${x}-${barValue}-${idx}`} x={x} y={y} width={barWidth} height={barHeight} fill={fill} rx="2">
            <animate attributeName="height" from="0" to={barHeight} dur={`${0.5 + idx * 0.1}s`} fill="freeze" />
            <animate attributeName="y" from={yBase} to={y} dur={`${0.5 + idx * 0.1}s`} fill="freeze" />
          </rect>
        );
      })}

      <g fontFamily="Arial" fontSize="10" fill={labelColor} textAnchor="middle">
        {labelsData.map((lbl, idx) => (
          <text key={`${lbl}-${idx}`} x={startX + idx * step + barWidth / 2} y="220">
            {lbl}
          </text>
        ))}
      </g>

      {showLimit && (
        <>
          {(() => {
            const normalizedLimit = Math.max(0, Math.min(1, limitValue / maxScale));
            const limitY = yBase - normalizedLimit * chartHeight;
            return (
              <>
                <line
                  x1="50"
                  y1={limitY}
                  x2="370"
                  y2={limitY}
                  stroke={limitColor}
                  strokeWidth="2"
                  strokeDasharray="5,3"
                />
                <text
                  x="370"
                  y={Math.max(12, limitY - 5)}
                  fontFamily="Arial"
                  fontSize="9"
                  fill={limitColor}
                  textAnchor="end"
                  fontWeight="bold"
                >
                  LIMITE: {Math.round(limitValue)} kW
                </text>
              </>
            );
          })()}
        </>
      )}

      {showValue && (
        <text
          x="380"
          y="30"
          fontFamily="Arial"
          fontSize="20"
          fontWeight="bold"
          fill={valueColor}
          textAnchor="end"
        >
          {valueText}
        </text>
      )}
    </svg>
  );
}
