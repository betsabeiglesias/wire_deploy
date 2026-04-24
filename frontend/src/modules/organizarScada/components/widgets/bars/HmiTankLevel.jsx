import React, { useId, useMemo } from "react";

const clampPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const HmiTankLevel = ({
  percent = 50,
  width = 150,
  height = 200,

  // 🎯 THEME
  backgroundColor,
  textColor,
  primaryColor,
  secondaryColor,

  // fallback originales
  tankDark = "#1a1f35",
  tankTop = "#252b45",
  fluidBase = "#8e44ad",
  gradientFrom = "#9b59b6",
  gradientTo = "#8e44ad",
  topFrom = "#d49cf2",
  topTo = "#9b59b6",

  percentColorOverride,
  accentColor,
  showValue = true,
  valueOffsetX = 0,
  valueOffsetY = 0,
  label = "",
  labelColor = "#e2e8f0",
  labelOffsetX = 0,
  labelOffsetY = -6,
  fontFamily = "Arial, sans-serif",
  waveEnabled = true,
  fluidOpacity = 1,
}) => {
  const safePercent = clampPercent(percent);
  const uid = useId().replace(/:/g, "");

  const tankGradId = `tankGrad-${uid}`;
  const topGradId = `topGrad-${uid}`;

  // 🎯 THEME APPLY
  const baseColor = accentColor || primaryColor || gradientFrom;
  const topColorFrom = accentColor || primaryColor || topFrom;
  const topColorTo = accentColor || secondaryColor || topTo;

  const percentColor =
    percentColorOverride ||
    textColor ||
    (safePercent > 80 ? "#ff4d4d" : "#ffffff");

  const viewBox = "0 0 120 180";
  const maxHeight = 110;
  const baseY = 150;
  const fluidHeight = (safePercent / 100) * maxHeight;
  const fluidY = baseY - fluidHeight;

  const fontSize = useMemo(() => {
    if (width <= 120) return 22;
    if (width <= 160) return 26;
    return 28;
  }, [width]);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: textColor,
        fontFamily,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: textColor || labelColor,
            transform: `translate(${labelOffsetX}px, ${labelOffsetY}px)`,
          }}
        >
          {label}
        </div>
      )}

      <svg width={140} height={180} viewBox={viewBox}>
        <defs>
          <linearGradient id={tankGradId}>
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor={secondaryColor || gradientTo} />
          </linearGradient>

          <linearGradient id={topGradId}>
            <stop offset="0%" stopColor={topColorFrom} />
            <stop offset="100%" stopColor={topColorTo} />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="150" rx="50" ry="20" fill={backgroundColor || tankDark} />
        <rect x="10" y="40" width="100" height="110" fill={backgroundColor || tankDark} />
        <ellipse cx="60" cy="40" rx="50" ry="20" fill={backgroundColor || tankTop} />

        <rect
          x="10"
          y={fluidY}
          width="100"
          height={fluidHeight}
          fill={`url(#${tankGradId})`}
          opacity={fluidOpacity}
        />

        <ellipse cx="60" cy="150" rx="50" ry="20" fill={baseColor} />

        <ellipse
          cx="60"
          cy={fluidY}
          rx="50"
          ry="20"
          fill={`url(#${topGradId})`}
        />

        {showValue && (
          <text
            x={60 + valueOffsetX}
            y={110 + valueOffsetY}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="700"
            fill={percentColor}
          >
            {Math.round(safePercent)}%
          </text>
        )}
      </svg>
    </div>
  );
};

export default HmiTankLevel;