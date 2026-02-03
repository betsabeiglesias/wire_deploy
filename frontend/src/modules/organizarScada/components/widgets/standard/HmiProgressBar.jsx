import React, { useId, useMemo } from "react";

const clampPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const HmiProgressBar = ({
  percent = 0,
  label = "LOREM IPSUM",
  width = 450,
  height = 90,
  colors = {},
}) => {
  const safePercent = clampPercent(percent);
  const maxWidth = 350;
  const fillWidth = (maxWidth * safePercent) / 100;
  const hatchWidth = maxWidth - fillWidth;
  const uid = useId().replace(/:/g, "");
  const gradientId = `blueGradient-${uid}`;
  const hatchId = `diagonalHatchBlue-${uid}`;

  const percentColor = useMemo(() => {
    if (safePercent > 85) return "#e74c3c";
    if (safePercent < 15) return "#f39c12";
    return "#ffffff";
  }, [safePercent]);

  const {
    trackFill = "#1e2a3e",
    trackStroke = "#2c6993",
    gradientFrom = "#3498db",
    gradientTo = "#2980b9",
    hatchStroke = "#2c6993",
    labelColor = "#999",
  } = colors;

  const centerX = 175;
  const centerY = 35;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 450 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientFrom} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientTo} stopOpacity="1" />
        </linearGradient>
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <path
            d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2"
            stroke={hatchStroke}
            strokeWidth="2"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="350"
        height="60"
        rx="10"
        ry="10"
        fill={trackFill}
        stroke={trackStroke}
        strokeWidth="2"
      />

      <rect
        x="0"
        y="0"
        width={fillWidth}
        height="60"
        rx="10"
        ry="10"
        fill={`url(#${gradientId})`}
      />

      <rect
        x={fillWidth}
        y="0"
        width={hatchWidth}
        height="60"
        rx="10"
        ry="10"
        fill={`url(#${hatchId})`}
      />

      <text
        x={centerX}
        y={centerY}
        fill={percentColor}
        fontSize="28px"
        fontWeight="700"
        textAnchor="middle"
        alignmentBaseline="middle"
        fontFamily="'Segoe UI', Roboto, Arial, sans-serif"
      >
        {Math.round(safePercent)}%
      </text>
    </svg>
  );
};

export default HmiProgressBar;
