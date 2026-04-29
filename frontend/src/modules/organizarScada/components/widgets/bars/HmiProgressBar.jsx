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

  // 🎯 THEME
  backgroundColor,
  textColor,
  primaryColor,
  secondaryColor,

  // fallback antiguos
  trackFill = "#1e2a3e",
  trackStroke = "#2c6993",
  gradientFrom = "#3498db",
  gradientTo = "#2980b9",
  hatchStroke = "#2c6993",
  labelColor = "#999",

  percentColorOverride,
  accentColor,
  showValue = true,
  showLabel = false,
  labelOffsetX = 0,
  labelOffsetY = -12,
  valueOffsetX = 0,
  valueOffsetY = 0,
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
    return textColor || "#ffffff";
  }, [safePercent, textColor]);

  const finalTextColor = percentColorOverride || percentColor;

  // 🎯 THEME APPLY
  const colorFrom = accentColor || primaryColor || gradientFrom;
  const colorTo = accentColor || secondaryColor || gradientTo;
  const hatchColor = accentColor || secondaryColor || hatchStroke;

  const finalTrackFill = backgroundColor || trackFill;
  const finalTrackStroke = secondaryColor || trackStroke;

  const centerX = 175;
  const centerY = 35;

  return (
    <svg width={width} height={height} viewBox="0 0 350 60">
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>

        <pattern id={hatchId} patternUnits="userSpaceOnUse" width="10" height="10">
          <path
            d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2"
            stroke={hatchColor}
            strokeWidth="2"
          />
        </pattern>
      </defs>

      <rect
        width="350"
        height="60"
        rx="10"
        fill={finalTrackFill}
        stroke={finalTrackStroke}
        strokeWidth="2"
      />

      <rect width={fillWidth} height="60" rx="10" fill={`url(#${gradientId})`} />

      <rect
        x={fillWidth}
        width={hatchWidth}
        height="60"
        rx="10"
        fill={`url(#${hatchId})`}
      />

      {showValue && (
        <text
          x={centerX + Number(valueOffsetX)}
          y={centerY + Number(valueOffsetY)}
          fill={finalTextColor}
          fontSize="28px"
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {Math.round(safePercent)}%
        </text>
      )}

      {showLabel && (
        <text
          x={10 + Number(labelOffsetX)}
          y={20 + Number(labelOffsetY)}
          fill={textColor || labelColor}
          fontSize="12px"
          fontWeight="600"
        >
          {label}
        </text>
      )}
    </svg>
  );
};

export default HmiProgressBar;