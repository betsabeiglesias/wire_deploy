import React, { useMemo } from "react";

const TempGauge = ({
  value = 89,
  min = 0,
  max = 120,
  label = "TEMP",
  unit = "°C",
  size = 220,
  className = "",
}) => {
  // Constantes de diseño
  const sizeViewBox = 200;
  const center = sizeViewBox / 2;
  const radiusPlate = 90;
  const radiusInner = 78;
  const radiusArc = 66;
  const startDeg = 140;
  const sweepDeg = 260; // Recorrido total

  // Cálculo de la aguja y valor
  const clampedValue = Math.max(min, Math.min(max, value));
  const ratio = (clampedValue - min) / (max - min);
  const rotation = startDeg + ratio * sweepDeg; // Grados de rotación de la aguja

  // Cálculo del arco de gradiente (dasharray)
  // Perímetro = 2 * PI * r
  const circumference = 2 * Math.PI * radiusArc;
  // Queremos que el arco cubra el 72% del círculo (aprox lo que cubre sweepDeg/360)
  // sweepDeg 260 / 360 ~= 0.722
  const arcLength = circumference * (sweepDeg / 360);
  const gapLength = circumference - arcLength;

  // Generación de ticks (marcas)
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
          stroke="rgba(251,146,60,0.95)"
          strokeWidth={i === 0 || i === tickCount - 1 ? 3 : 2}
          strokeLinecap="round"
        />
      );
    });
  }, [startDeg, sweepDeg, center]);

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${sizeViewBox} ${sizeViewBox}`}
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(251,146,60,1)" />
            <stop offset="70%" stopColor="rgba(249,115,22,1)" />
            <stop offset="100%" stopColor="rgba(239,68,68,1)" />
          </linearGradient>
        </defs>

        {/* Fondo placa circular */}
        <circle
          cx={center}
          cy={center}
          r={radiusPlate}
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="2"
        />

        {/* Inner plate */}
        <circle
          cx={center}
          cy={center}
          r={radiusInner}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
        />

        {/* Arco principal */}
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

        {/* Ticks group */}
        <g>{ticks}</g>

        {/* Aguja y Centro */}
        <g
          className="transition-transform duration-500 ease-out"
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <path
            d="M -3 6 L 0 -58 L 3 6 Z"
            fill="rgba(255,255,255,0.95)"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
            transform={`translate(${center} ${center})`}
          />
          <circle
            cx={center}
            cy={center}
            r={7}
            fill="rgba(255,255,255,0.85)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
        </g>

        {/* Textos */}
        <text
          x={center}
          y={center - 22}
          textAnchor="middle"
          fill="rgba(248,113,113,0.95)"
          fontSize="14"
          fontWeight="800"
          className="font-sans"
        >
          {label}
        </text>

        <text
          x={center}
          y={center + 20}
          textAnchor="middle"
          fill="rgba(248,113,113,0.98)"
          fontSize="26"
          fontWeight="900"
          className="font-sans"
        >
          {Math.round(clampedValue)}
          {unit}
        </text>

        {/* Decoración dots */}
        <g transform={`translate(${center} ${center})`}>
          <circle cx="-18" cy="60" r="4.5" fill="rgba(148,163,184,0.35)" />
          <circle cx="0" cy="60" r="4.5" fill="rgba(148,163,184,0.35)" />
          <circle cx="18" cy="60" r="4.5" fill="rgba(148,163,184,0.35)" />
        </g>
      </svg>
    </div>
  );
};

export default TempGauge;
