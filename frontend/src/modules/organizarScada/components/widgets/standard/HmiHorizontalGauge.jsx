import React, { useMemo } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const HmiHorizontalGauge = ({
  value = 0,
  min = 0,
  max = 100,
  variant = "precision",
  width = 240,
  height = 140,
  accentColor,
}) => {
  const cx = 120;
  const cy = 120;
  const r = 100;

  const safeValue = clamp(value, min, max);
  const ratio = (safeValue - min) / (max - min || 1);
  const angle = -90 + ratio * 180;

  const ticks = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 10; i += 1) {
      const ang = (-180 + i * 18) * (Math.PI / 180);
      const length =
        variant === "precision" ? (i % 2 === 0 ? 15 : 8) : 12;
      const x1 = cx + Math.cos(ang) * (r - length);
      const y1 = cy + Math.sin(ang) * (r - length);
      const x2 = cx + Math.cos(ang) * r;
      const y2 = cy + Math.sin(ang) * r;
      lines.push({
        x1,
        y1,
        x2,
        y2,
        stroke: i > 8 ? "#e11d48" : "#334155",
        strokeWidth: variant === "heavy" ? 4 : 2,
      });
    }
    return lines;
  }, [variant]);

  const needle = useMemo(() => {
    if (variant === "precision") {
      return {
        d: `M ${cx - 1},${cy} L ${cx},15 L ${cx + 1},${cy} Z`,
        fill: accentColor || "#1e293b",
      };
    }
    if (variant === "heavy") {
      return {
        d: `M ${cx - 3},${cy} L ${cx - 1},25 L ${cx + 1},25 L ${cx + 3},${cy} Z`,
        fill: accentColor || "#1e40af",
      };
    }
    return {
      d: `M ${cx - 4},${cy + 5} L ${cx},20 L ${cx + 4},${cy + 5} Z`,
      fill: accentColor || "#be123c",
    };
  }, [variant, accentColor]);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 140"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M 10,120 A 110,110 0 0,1 230,120 L 120,120 Z"
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth="1"
      />

      <g>
        {ticks.map((line, idx) => (
          <line
            key={`tick-${idx}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
          />
        ))}
      </g>

      {variant === "arc" && (
        <path
          d={`M ${cx - 85},120 A 85,85 0 0,1 ${cx + 85},120`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: `rotate(${angle}deg)`,
          transition: "transform 1.2s cubic-bezier(0.19, 1, 0.22, 1)",
          filter: "drop-shadow(2px 4px 2px rgba(0,0,0,0.3))",
        }}
      >
        <path d={needle.d} fill={needle.fill} />
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill="#475569"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
};

export default HmiHorizontalGauge;
