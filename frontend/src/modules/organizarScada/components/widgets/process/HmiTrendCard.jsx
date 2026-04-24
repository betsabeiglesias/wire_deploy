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

const HmiTrendCard = ({
  title = "Caudal de Proceso - Cuba 2",
  value = 5684,
  unitLabel = "LOREM IPSUM",
  minValue = 0,
  maxValue = 10000,
  series = [],
  width = 400,
  height = 220,

  backgroundColor = "#0f172a",
  textColor = "#ffffff",
  primaryColor = "#2196F3",
  secondaryColor = "#03A9F4",

  accentColor,
}) => {
  const uid = useId().replace(/:/g, "");
  const gradId = `grad-${uid}`;
  const lineGradId = `lineGrad-${uid}`;

  const mainColor = accentColor || primaryColor;
  const endColor = accentColor || secondaryColor;

  const pointsCount = 10;
  const step = width / (pointsCount - 1);
  const seriesValues = buildSeries(series, 110, pointsCount);

  const pathData = useMemo(() => {
    let path = `M 0 ${seriesValues[0]}`;
    for (let i = 1; i < seriesValues.length; i++) {
      const x = i * step;
      const y = seriesValues[i];
      path += ` L ${x} ${y}`;
    }
    return path;
  }, [seriesValues, step]);

  const fillData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  const displayValue = Math.round(value);

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={gradId}>
          <stop offset="0%" stopColor={mainColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>

        <linearGradient id={lineGradId}>
          <stop offset="0%" stopColor={textColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={textColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} rx="30" fill={`url(#${gradId})`} />

      <text x="35" y="45" fill={textColor} fontSize="14">
        {title}
      </text>

      <text x="35" y="110" fill={textColor} fontSize="70" fontWeight="700">
        {displayValue}
      </text>

      <text x="38" y="140" fill={textColor} fontSize="18">
        {unitLabel}
      </text>

      <path d={fillData} fill={`url(#${lineGradId})`} opacity="0.3" />

      <path
        d={pathData}
        fill="none"
        stroke={textColor}
        strokeWidth="4"
      />
    </svg>
  );
};

export default HmiTrendCard;