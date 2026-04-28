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

  // fallbacks
  tankDark = "#1a1f35",
  tankTop = "#252b45",
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
  fluidOpacity = 1,
}) => {
  const safePercent = clampPercent(percent);
  const uid = useId().replace(/:/g, "");

  const tankGradId = `tankGrad-${uid}`;
  const topGradId = `topGrad-${uid}`;

  // Colores aplicados
  const baseColor = accentColor || primaryColor || gradientFrom;
  const topColorFrom = accentColor || primaryColor || topFrom;
  const topColorTo = accentColor || secondaryColor || topTo;
  
  // Color para las líneas de borde
  const strokeColor = secondaryColor || "#4a5568"; 

  const percentColor =
    percentColorOverride ||
    textColor ||
    (safePercent > 80 ? "#ff4d4d" : "#ffffff");

  // El viewBox tiene un margen para que el stroke no se corte
  const viewBox = "-2 -2 124 184"; 
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

      <svg 
        width="100%" 
        height="100%" 
        viewBox={viewBox} 
        preserveAspectRatio="xMidYMid meet"
      >
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

        {/* --- ESTRUCTURA DEL TANQUE (FONDO) --- */}
        {/* Base inferior */}
        <ellipse 
            cx="60" cy="150" rx="50" ry="20" 
            fill={backgroundColor || tankDark} 
            stroke={strokeColor} 
            strokeWidth="1.5" 
        />
        {/* Cuerpo central */}
        <rect 
            x="10" y="40" width="100" height="110" 
            fill={backgroundColor || tankDark} 
            stroke={strokeColor} 
            strokeWidth="1.5" 
        />
        {/* Tapa superior */}
        <ellipse 
            cx="60" cy="40" rx="50" ry="20" 
            fill={backgroundColor || tankTop} 
            stroke={strokeColor} 
            strokeWidth="1.5" 
        />

        {/* --- FLUIDO --- */}
        {/* Cuerpo del fluido */}
        <rect
          x="10"
          y={fluidY}
          width="100"
          height={fluidHeight}
          fill={`url(#${tankGradId})`}
          opacity={fluidOpacity}
        />

        {/* Base del fluido (solo si hay algo de porcentaje) */}
        {safePercent > 0 && (
          <ellipse cx="60" cy="150" rx="50" ry="20" fill={baseColor} />
        )}

        {/* Superficie superior del fluido (la elipse que sube y baja) */}
        {safePercent > 0 && (
          <ellipse
            cx="60"
            cy={fluidY}
            rx="50"
            ry="20"
            fill={`url(#${topGradId})`}
            stroke={strokeColor} // Borde para definir la superficie
            strokeWidth="0.5"
          />
        )}

        {/* Líneas laterales de refuerzo para que el fluido no tape el borde del tanque */}
        <line x1="10" y1="40" x2="10" y2="150" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="110" y1="40" x2="110" y2="150" stroke={strokeColor} strokeWidth="1.5" />

        {showValue && (
          <text
            x={60 + valueOffsetX}
            y={110 + valueOffsetY}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="700"
            fill={percentColor}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {Math.round(safePercent)}%
          </text>
        )}
      </svg>
    </div>
  );
};

export default HmiTankLevel;