import React, { useMemo } from "react";

const TempGauge = ({
  value = 89,
  min = 0,
  max = 120,
  label = "Texto",
  unit = "C",
  size = 220,
  className = "",
  labelColor = "rgba(248,113,113,0.95)",
  valueColor = "rgba(248,113,113,0.98)",
  labelOffsetX = 0,
  labelOffsetY = 0,
  valueOffsetX = 0,
  valueOffsetY = 0,
  needleColor = "rgba(255,255,255,0.95)",
  tickColor = "rgba(251,146,60,0.95)",
  arcStartColor = "rgba(251,146,60,1)",
  arcMidColor = "rgba(249,115,22,1)",
  arcEndColor = "rgba(239,68,68,1)",
  showMinMax = true,
  showLabel = true,
  showValue = true,
  minMaxColor = "rgba(148,163,184,0.9)",
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
        />
      );
    });
  }, [startDeg, sweepDeg, center, tickColor]);

  return (
    <div className={`relative flex ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${sizeViewBox} ${sizeViewBox}`}>
        <circle cx={center} cy={center} r={radiusPlate} fill="rgba(255,255,255,0.12)" />
        <circle cx={center} cy={center} r={radiusInner} fill="rgba(255,255,255,0.08)" />

        <circle
          cx={center}
          cy={center}
          r={radiusArc}
          fill="none"
          stroke="url(#tempGrad)"
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${gapLength}`}
          transform={`rotate(${startDeg} ${center} ${center})`}
        />

        <g>{ticks}</g>

        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}>
          <line x1={center} y1={center} x2={center} y2="30" stroke={needleColor} />
        </g>
      </svg>
    </div>
  );
};

export default TempGauge;