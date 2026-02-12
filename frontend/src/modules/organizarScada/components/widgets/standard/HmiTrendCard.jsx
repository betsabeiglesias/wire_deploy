import React, { useId, useMemo } from "react";

const clampPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const buildSeries = (history = [], fallback = 110, points = 10) => {
  if (history.length >= points) return history.slice(-points);
  if (history.length) return history;
  return Array(points).fill(fallback);
};

const toY = (value, min, max, minY, maxY) => {
  const pct = clampPercent(((value - min) / (max - min)) * 100);
  return maxY - ((maxY - minY) * pct) / 100;
};

const HmiTrendCard = ({
  title = "Caudal de Proceso - Cuba 2",
  value = 5684,
  unitLabel = "LOREM IPSUM",
  minValue = 0,
  maxValue = 10000,
  series = [],
  width = 400,
  height = 220,
  colors = {},
}) => {
  const uid = useId().replace(/:/g, "");
  const gradId = `blueGrad-${uid}`;
  const lineGradId = `lineGrad-${uid}`;

  const {
    gradStart = "#2196F3",
    gradEnd = "#03A9F4",
    textMuted = "rgba(255,255,255,0.7)",
  } = colors;

  const chartMin = 50;
  const chartMax = 180;
  const chartHeight = height;
  const chartWidth = width;
  const pointsCount = 10;
  const step = chartWidth / (pointsCount - 1);
  const seriesValues = buildSeries(series, 110, pointsCount);

  const pathData = useMemo(() => {
    let path = `M 0 ${seriesValues[0]}`;
    for (let i = 1; i < seriesValues.length; i += 1) {
      const x = i * step;
      const y = seriesValues[i];
      path += ` L ${x} ${y}`;
    }
    return path;
  }, [seriesValues, step]);

  const fillData = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  const displayValue = Math.round(
    minValue + ((maxValue - minValue) * clampPercent((value - minValue) / (maxValue - minValue) * 100)) / 100
  );

  const ringScale = 0.7;
  const ringX = 330;
  const ringY = 70;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradStart} stopOpacity="1" />
          <stop offset="100%" stopColor={gradEnd} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={lineGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} rx="30" ry="30" fill={`url(#${gradId})`} />

      <text
        x="35"
        y="45"
        fill={textMuted}
        fontSize="14"
        fontWeight="700"
        letterSpacing="1"
        fontFamily="'Segoe UI', sans-serif"
      >
        {title}
      </text>

      <text
        x="35"
        y="110"
        fill="#ffffff"
        fontSize="70"
        fontWeight="700"
        fontFamily="'Segoe UI', sans-serif"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {displayValue}
      </text>

      <text
        x="38"
        y="140"
        fill="rgba(255,255,255,0.8)"
        fontSize="18"
        letterSpacing="2"
        fontFamily="'Segoe UI', sans-serif"
      >
        {unitLabel}
      </text>

      <path d={fillData} fill={`url(#${lineGradId})`} opacity="0.3" />
      <path
        d={pathData}
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g transform={`translate(${ringX}, ${ringY}) scale(${ringScale})`}>
        <circle r="48" fill="none" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.4" />
        <circle r="28" fill="none" stroke="#ffffff" strokeWidth="6" />
      </g>
    </svg>
  );
};

export default HmiTrendCard;
