import React from "react";

/**
 * LuxuriesStackedBarChart
 * Renderiza el SVG del gráfico apilado igual a la referencia.
 * width/height ajustables; puede usarse style para escalar al contenedor.
 */
export default function LuxuriesStackedBarChart({
  width = 1200,
  height = 650,
  style,
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 1200 650"
      role="img"
      aria-label="How I spend money on little luxuries by day of week"
      style={style}
    >
      <rect width="100%" height="100%" fill="#ffffff" />

      {/* Title */}
      <text
        x="60"
        y="60"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="44"
        fontWeight="500"
        fill="#111"
      >
        Estadisticas de la semana
      </text>

      {/* Gridlines + Y labels */}
      <line
        x1="120"
        y1="540"
        x2="900"
        y2="540"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="547"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        0
      </text>

      <line
        x1="120"
        y1="456"
        x2="900"
        y2="456"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="463"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        5
      </text>

      <line
        x1="120"
        y1="372"
        x2="900"
        y2="372"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="379"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        10
      </text>

      <line
        x1="120"
        y1="288"
        x2="900"
        y2="288"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="295"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        15
      </text>

      <line
        x1="120"
        y1="204"
        x2="900"
        y2="204"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="211"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        20
      </text>

      <line
        x1="120"
        y1="120"
        x2="900"
        y2="120"
        stroke="#d9d9d9"
        strokeWidth="2"
      />
      <text
        x="100"
        y="127"
        textAnchor="end"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fill="#111"
      >
        25
      </text>

      {/* Axes */}
      <line x1="120" y1="120" x2="120" y2="540" stroke="#000" strokeWidth="3" />
      <line x1="120" y1="540" x2="900" y2="540" stroke="#000" strokeWidth="3" />

      {/* Bars (Coffee #4285F4, Chocolate #EA4335, Soda #FBBC05, Ice cream #34A853) */}
      {/* Monday: Coffee 5, Chocolate 8, Soda 3, Ice cream 3 (Total 19) */}
      <rect x="120" y="456" width="86" height="84" fill="#4285F4" />
      <rect x="120" y="321.6" width="86" height="134.4" fill="#EA4335" />
      <rect x="120" y="271.2" width="86" height="50.4" fill="#FBBC05" />
      <rect x="120" y="220.8" width="86" height="50.4" fill="#34A853" />

      {/* Tuesday: Coffee 10, Soda 3, Ice cream 6 (Total 19) */}
      <rect x="235.6667" y="372" width="86" height="168" fill="#4285F4" />
      <rect x="235.6667" y="321.6" width="86" height="50.4" fill="#FBBC05" />
      <rect x="235.6667" y="220.8" width="86" height="100.8" fill="#34A853" />

      {/* Wednesday: Coffee 8, Soda 6 (Total 14) */}
      <rect x="351.3333" y="405.6" width="86" height="134.4" fill="#4285F4" />
      <rect x="351.3333" y="304.8" width="86" height="100.8" fill="#FBBC05" />

      {/* Thursday: Coffee 7, Chocolate 6, Soda 3 (Total 16) */}
      <rect x="467" y="422.4" width="86" height="117.6" fill="#4285F4" />
      <rect x="467" y="321.6" width="86" height="100.8" fill="#EA4335" />
      <rect x="467" y="271.2" width="86" height="50.4" fill="#FBBC05" />

      {/* Friday: Coffee 10, Soda 9 (Total 19) */}
      <rect x="582.6667" y="372" width="86" height="168" fill="#4285F4" />
      <rect x="582.6667" y="220.8" width="86" height="151.2" fill="#FBBC05" />

      {/* Saturday: Coffee 5, Ice cream 6 (Total 11) */}
      <rect x="698.3333" y="456" width="86" height="84" fill="#4285F4" />
      <rect x="698.3333" y="355.2" width="86" height="100.8" fill="#34A853" />

      {/* Sunday: Chocolate 10, Ice cream 12 (Total 22) */}
      <rect x="814" y="372" width="86" height="168" fill="#EA4335" />
      <rect x="814" y="170.4" width="86" height="201.6" fill="#34A853" />

      {/* X labels */}
      <text
        x="163"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Monday
      </text>
      <text
        x="278.6667"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Tuesday
      </text>
      <text
        x="394.3333"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Wednesday
      </text>
      <text
        x="510"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Thursday
      </text>
      <text
        x="625.6667"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Friday
      </text>
      <text
        x="741.3333"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Saturday
      </text>
      <text
        x="857"
        y="585"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
      >
        Sunday
      </text>

      {/* Axis labels */}
      <text
        x="40"
        y="330"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
        transform="rotate(-90 40 330)"
        textAnchor="middle"
      >
       
      </text>

      <text
        x="510"
        y="610"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="24"
        fill="#111"
        textAnchor="middle"
      >
       
      </text>

      {/* Legend */}
      <text
        x="950"
        y="230"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="28"
        fill="#111"
      >
        {/* Total */}
      </text>

      <rect x="950" y="268" width="28" height="28" rx="4" fill="#34A853" />
      <text
        x="995"
        y="290"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="26"
        fill="#111"
      >
        Temperatura
      </text>

      <rect x="950" y="323" width="28" height="28" rx="4" fill="#FBBC05" />
      <text
        x="995"
        y="345"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="26"
        fill="#111"
      >
        Precion
      </text>

      <rect x="950" y="378" width="28" height="28" rx="4" fill="#EA4335" />
      <text
        x="995"
        y="400"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="26"
        fill="#111"
      >
        Humedad
      </text>

      <rect x="950" y="433" width="28" height="28" rx="4" fill="#4285F4" />
      <text
        x="995"
        y="455"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="26"
        fill="#111"
      >
        Vibracion
      </text>
    </svg>
  );
}
