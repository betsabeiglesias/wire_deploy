import React, { useMemo } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const HmiHorizontalGauge = ({
  value = 0,
  min = 0,
  max = 100,
  variant = "precision",
  width = 240,
  height = 140,

  // 🎯 THEME
  backgroundColor = "#f8fafc",
  primaryColor = "#3b82f6",
  secondaryColor = "#94a3b8",
  textColor = "#1e293b",
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
        stroke: i > 8 ? primaryColor : secondaryColor,
        strokeWidth: variant === "heavy" ? 4 : 2,
      });
    }
    return lines;
  }, [variant, secondaryColor, primaryColor]);

  const needle = useMemo(() => {
    return {
      d: `M ${cx - 2},${cy} L ${cx},20 L ${cx + 2},${cy} Z`,
      fill: primaryColor,
    };
  }, [primaryColor]);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 140"
      style={{ background: backgroundColor }}
    >
      <path
        d="M 10,120 A 110,110 0 0,1 230,120 L 120,120 Z"
        fill={backgroundColor}
        stroke={secondaryColor}
        strokeWidth="1"
      />

      {ticks.map((line, idx) => (
        <line key={idx} {...line} />
      ))}

      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: `rotate(${angle}deg)`,
          transition: "transform 1s ease",
        }}
      >
        <path d={needle.d} fill={needle.fill} />
        <circle cx={cx} cy={cy} r="6" fill={secondaryColor} />
      </g>
    </svg>
  );
};

export default HmiHorizontalGauge;