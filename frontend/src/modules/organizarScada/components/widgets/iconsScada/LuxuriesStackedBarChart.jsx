import React from "react";

/**
 * LuxuriesStackedBarChart
 * Ahora usa theme dinámico (industrial-ready)
 */
export default function LuxuriesStackedBarChart({
  width = 1200,
  height = 650,
  style,

  // 👇 NUEVO: vienen del registry
  backgroundColor = "#ffffff",
  textColor = "#111",
  gridColor = "#d9d9d9",
  axisColor = "#000",

  primaryColor = "#4285F4",
  secondaryColor = "#EA4335",
  tertiaryColor = "#FBBC05",
  quaternaryColor = "#34A853",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 1200 650"
      role="img"
      aria-label="Semana"
      style={style}
    >
      {/* BACKGROUND dinámico */}
      <rect width="100%" height="100%" fill={backgroundColor} />

      {/* Title */}
      <text
        x="60"
        y="60"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="44"
        fontWeight="500"
        fill={textColor}
      >
        Estadisticas de la semana
      </text>

      {/* Gridlines + Y labels */}
      {[540, 456, 372, 288, 204, 120].map((y, i) => {
        const value = i * 5;
        return (
          <g key={i}>
            <line
              x1="120"
              y1={y}
              x2="900"
              y2={y}
              stroke={gridColor}
              strokeWidth="2"
            />
            <text
              x="100"
              y={y + 7}
              textAnchor="end"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="22"
              fill={textColor}
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1="120" y1="120" x2="120" y2="540" stroke={axisColor} strokeWidth="3" />
      <line x1="120" y1="540" x2="900" y2="540" stroke={axisColor} strokeWidth="3" />

      {/* BARS (ahora dinámicas) */}
      <rect x="120" y="456" width="86" height="84" fill={primaryColor} />
      <rect x="120" y="321.6" width="86" height="134.4" fill={secondaryColor} />
      <rect x="120" y="271.2" width="86" height="50.4" fill={tertiaryColor} />
      <rect x="120" y="220.8" width="86" height="50.4" fill={quaternaryColor} />

      <rect x="235.6667" y="372" width="86" height="168" fill={primaryColor} />
      <rect x="235.6667" y="321.6" width="86" height="50.4" fill={tertiaryColor} />
      <rect x="235.6667" y="220.8" width="86" height="100.8" fill={quaternaryColor} />

      <rect x="351.3333" y="405.6" width="86" height="134.4" fill={primaryColor} />
      <rect x="351.3333" y="304.8" width="86" height="100.8" fill={tertiaryColor} />

      <rect x="467" y="422.4" width="86" height="117.6" fill={primaryColor} />
      <rect x="467" y="321.6" width="86" height="100.8" fill={secondaryColor} />
      <rect x="467" y="271.2" width="86" height="50.4" fill={tertiaryColor} />

      <rect x="582.6667" y="372" width="86" height="168" fill={primaryColor} />
      <rect x="582.6667" y="220.8" width="86" height="151.2" fill={tertiaryColor} />

      <rect x="698.3333" y="456" width="86" height="84" fill={primaryColor} />
      <rect x="698.3333" y="355.2" width="86" height="100.8" fill={quaternaryColor} />

      <rect x="814" y="372" width="86" height="168" fill={secondaryColor} />
      <rect x="814" y="170.4" width="86" height="201.6" fill={quaternaryColor} />

      {/* X labels */}
      {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d, i) => (
        <text
          key={i}
          x={163 + i * 115.6667}
          y="585"
          textAnchor="middle"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="24"
          fill={textColor}
        >
          {d}
        </text>
      ))}

      {/* Legend */}
      <rect x="950" y="268" width="28" height="28" rx="4" fill={quaternaryColor} />
      <text x="995" y="290" fontSize="26" fill={textColor}>Temperatura</text>

      <rect x="950" y="323" width="28" height="28" rx="4" fill={tertiaryColor} />
      <text x="995" y="345" fontSize="26" fill={textColor}>Presion</text>

      <rect x="950" y="378" width="28" height="28" rx="4" fill={secondaryColor} />
      <text x="995" y="400" fontSize="26" fill={textColor}>Humedad</text>

      <rect x="950" y="433" width="28" height="28" rx="4" fill={primaryColor} />
      <text x="995" y="455" fontSize="26" fill={textColor}>Vibracion</text>
    </svg>
  );
}