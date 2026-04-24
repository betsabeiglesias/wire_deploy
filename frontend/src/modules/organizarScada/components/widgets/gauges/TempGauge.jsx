import React, { useMemo } from "react";

const TempGauge = ({
  value = 89,
  min = 0,
  max = 120,
  label = "Texto",
  unit = "C",
  size = 220,
  className = "",

  // 🎯 COLORES DESDE THEME (ANTES HARDCODE)
  labelColor = "#94a3b8",
  valueColor = "#ffffff",
  needleColor = "#ffffff",
  tickColor = "#64748b",
  arcStartColor = "#22c55e",
  arcMidColor = "#16a34a",
  arcEndColor = "#15803d",
  minMaxColor = "#64748b",

  // offsets
  labelOffsetX = 0,
  labelOffsetY = 0,
  valueOffsetX = 0,
  valueOffsetY = 0,

  // flags
  showMinMax = true,
  showLabel = true,
  showValue = true,
  minMaxFontSize = 14,
}) => {

  const sizeViewBox = 180;
  const center = sizeViewBox / 2;
  const radiusPlate = 90;
  const radiusInner = 78;
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

  const polarToXY = (deg, r) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: center + Math.cos(rad) * r,
      y: center + Math.sin(rad) * r,
    };
  };

  const minPos = polarToXY(startDeg, 84);
  const maxPos = polarToXY(startDeg + sweepDeg, 84);

  const tickCount = 13;

  const ticks = useMemo(() => {
    return Array.from({ length: tickCount }).map((_, i) => {
      const t = i / (tickCount - 1);
      const angDeg = startDeg + t * sweepDeg;
      const angRad = (angDeg * Math.PI) / 180;

      const r1 = 54;
      const r2 = 62;

      const x1 = center + Math.cos(angRad) * r1;
      const y1 = center + Math.sin(angRad) * r1;
      const x2 = center + Math.cos(angRad) * r2;
      const y2 = center + Math.sin(angRad) * r2;

      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={tickColor}
          strokeWidth={i === 0 || i === tickCount - 1 ? 3 : 2}
          strokeLinecap="round"
        />
      );
    });
  }, [tickColor]);

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg viewBox={`0 0 ${sizeViewBox} ${sizeViewBox}`} className="w-full h-full">
        <defs>
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={arcStartColor} />
            <stop offset="70%" stopColor={arcMidColor} />
            <stop offset="100%" stopColor={arcEndColor} />
          </linearGradient>
        </defs>

        {/* Fondo */}
        <circle
          cx={center}
          cy={center}
          r={radiusPlate}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
        />

        <circle
          cx={center}
          cy={center}
          r={radiusInner}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1.5"
        />

        {/* Arco */}
        <circle
          cx={center}
          cy={center}
          r={radiusArc}
          fill="none"
          stroke="url(#tempGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          transform={`rotate(${startDeg} ${center} ${center})`}
        />

        {/* Ticks */}
        <g>{ticks}</g>

        {/* Min / Max */}
        {showMinMax && (
          <>
            <text
              x={minPos.x}
              y={minPos.y}
              textAnchor="middle"
              fill={minMaxColor}
              fontSize={minMaxFontSize}
              fontWeight="800"
            >
              {min}
            </text>
            <text
              x={maxPos.x}
              y={maxPos.y}
              textAnchor="middle"
              fill={minMaxColor}
              fontSize={minMaxFontSize}
              fontWeight="800"
            >
              {max}
            </text>
          </>
        )}

        {/* Aguja */}
        <g
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <path
            d="M -3 6 L 0 -58 L 3 6 Z"
            fill={needleColor}
            transform={`translate(${center} ${center})`}
          />
          <circle cx={center} cy={center} r={7} fill={needleColor} />
        </g>

        {/* Label */}
        {showLabel && (
          <text
            x={center + Number(labelOffsetX)}
            y={center - 22 + Number(labelOffsetY)}
            textAnchor="middle"
            fill={labelColor}
            fontSize="14"
            fontWeight="800"
          >
            {label}
          </text>
        )}

        {/* Value */}
        {showValue && (
          <text
            x={center + Number(valueOffsetX)}
            y={center + 20 + Number(valueOffsetY)}
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