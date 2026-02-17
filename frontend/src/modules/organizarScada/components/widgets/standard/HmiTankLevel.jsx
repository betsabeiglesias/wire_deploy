import React, { useId, useMemo } from "react";

const clampPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const HmiTankLevel = ({
  percent = 50,
  width = 150,
  height = 200,
  tankDark = "#1a1f35",
  tankTop = "#252b45",
  fluidBase = "#8e44ad",
  gradientFrom = "#9b59b6",
  gradientTo = "#8e44ad",
  topFrom = "#d49cf2",
  topTo = "#9b59b6",
  percentColorOverride,
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
  const percentColor =
    percentColorOverride || (safePercent > 80 ? "#ff4d4d" : "#ffffff");

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
        color: "#fff",
        fontFamily,
        userSelect: "none",
      }}
    >
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: labelColor,
            lineHeight: 1,
            transform: `translate(${Number(labelOffsetX || 0)}px, ${Number(labelOffsetY || 0)}px)`,
          }}
        >
          {label}
        </div>
      )}
      <svg
        width={Math.min(width, 140)}
        height={Math.min(height, 180)}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={tankGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity="1" />
            <stop offset="100%" stopColor={gradientTo} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={topGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={topFrom} stopOpacity="1" />
            <stop offset="100%" stopColor={topTo} stopOpacity="1" />
          </linearGradient>
        </defs>
        <style>{`
          @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .fluid-top-${uid} {
            animation: wave 2s infinite ease-in-out;
            transform-origin: center;
          }
        `}</style>

        <ellipse cx="60" cy="150" rx="50" ry="20" fill={tankDark} />
        <rect x="10" y="40" width="100" height="110" fill={tankDark} />
        <ellipse cx="60" cy="40" rx="50" ry="20" fill={tankTop} />

        <g>
          <rect
            x="10"
            y={fluidY}
            width="100"
            height={fluidHeight}
            fill={`url(#${tankGradId})`}
            opacity={fluidOpacity}
          />
          <ellipse cx="60" cy="150" rx="50" ry="20" fill={fluidBase} opacity={fluidOpacity} />
          <ellipse
            className={waveEnabled ? `fluid-top-${uid}` : undefined}
            cx="60"
            cy={fluidY}
            rx="50"
            ry="20"
            fill={`url(#${topGradId})`}
            opacity={fluidOpacity}
          />
        </g>

        <rect x="20" y="40" width="15" height="110" fill="#000000" opacity="0.05" />

        {showValue && (
          <text
            x={60 + Number(valueOffsetX || 0)}
            y={110 + Number(valueOffsetY || 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fontFamily}
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
