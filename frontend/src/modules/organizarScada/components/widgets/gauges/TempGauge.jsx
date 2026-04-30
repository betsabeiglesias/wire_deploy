import React, { useMemo } from "react";

const TempGauge = ({
  value = 89,
  min = 0,
  max = 120,
  label = "Texto",
  unit = "C",
  size = 220,
  className = "",

  // 🎯 THEME
  labelColor = "#94a3b8",
  valueColor = "#ffffff",
  needleColor = "#ffffff",
  tickColor = "#64748b",
  arcStartColor = "#22c55e",
  arcMidColor = "#16a34a",
  arcEndColor = "#15803d",
  minMaxColor = "#64748b",
  backgroundColor = "transparent",

  labelOffsetX = 0,
  labelOffsetY = 0,
  valueOffsetX = 0,
  valueOffsetY = 0,

  showMinMax = true,
  showLabel = true,
  showValue = true,
  minMaxFontSize = 14,
}) => {

  const gradientId = useMemo(
    () => `tempGrad-${Math.random().toString(36).slice(2)}`,
    []
  );

  const sizeViewBox = 180;
  const center = sizeViewBox / 2;
  const radiusArc = 66;

  const startDeg = 140;
  const sweepDeg = 260;

  const safeMax = max === min ? min + 1 : max;
  const clampedValue = Math.max(min, Math.min(safeMax, value));
  const ratio = (clampedValue - min) / (safeMax - min);
  const rotation = startDeg + ratio * sweepDeg;

  const circumference = 2 * Math.PI * radiusArc;
  const arcLength = circumference * (sweepDeg / 360);
  const gapLength = circumference - arcLength;

  const ticks = useMemo(() => {
    return Array.from({ length: 13 }).map((_, i) => {
      const t = i / 12;
      const ang = (startDeg + t * sweepDeg) * Math.PI / 180;

      return (
        <line
          key={i}
          x1={center + Math.cos(ang) * 54}
          y1={center + Math.sin(ang) * 54}
          x2={center + Math.cos(ang) * 62}
          y2={center + Math.sin(ang) * 62}
          stroke={tickColor}
          strokeWidth={i === 0 || i === 12 ? 3 : 2}
        />
      );
    });
  }, [tickColor]);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: backgroundColor,
      }}
    >
      <svg viewBox={`0 0 ${sizeViewBox} ${sizeViewBox}`}>

        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={arcStartColor} />
            <stop offset="70%" stopColor={arcMidColor} />
            <stop offset="100%" stopColor={arcEndColor} />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radiusArc}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${gapLength}`}
          transform={`rotate(${startDeg} ${center} ${center})`}
        />

        <g>{ticks}</g>

        <g
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <path d="M -3 6 L 0 -58 L 3 6 Z" fill={needleColor} transform={`translate(${center} ${center})`} />
          <circle cx={center} cy={center} r={7} fill={needleColor} />
        </g>

        {showLabel && (
          <text
            x={center + labelOffsetX}
            y={center - 22 + labelOffsetY}
            textAnchor="middle"
            fill={labelColor}
            fontSize="14"
            fontWeight="800"
          >
            {label}
          </text>
        )}

        {showValue && (
          <text
            x={center + valueOffsetX}
            y={center + 20 + valueOffsetY}
            textAnchor="middle"
            fill={valueColor}
            fontSize="26"
            fontWeight="900"
          >
            {Math.round(clampedValue)}
            {unit}
          </text>
        )}
      </svg>
    </div>
  );
};

export default TempGauge;