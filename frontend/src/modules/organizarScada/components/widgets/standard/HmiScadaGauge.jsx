import React, { useMemo } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const polarToCartesian = (cx, cy, r, ang) => {
  const rad = ((ang - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (x, y, r, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, r, endAngle);
  const end = polarToCartesian(x, y, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
};

const HmiScadaGauge = ({
  value = 0,
  min = 0,
  max = 100,
  unit = "",
  baseColor = "#94a3b8",
  accentColor,
  zones = [],
  width = 220,
  height = 220,
  showValue = true,
  visible = true,
  showLabel = true,
  valueOffsetX = 0,
  valueOffsetY = 0,
  unitOffsetX = 0,
  unitOffsetY = 0,
  valueColor = "#ffffff",
  unitColor = "#64748b",
}) => {
  if (visible === false) return null;

  const color = accentColor || baseColor;

  const size = 200;
  const center = size / 2;
  const startAngle = 150;
  const endAngle = 390;

  const safeValue = clamp(value, min, max);
  const percent = (safeValue - min) / (max - min || 1);
  const needleAngle = startAngle + percent * (endAngle - startAngle);

  const tickLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 20; i += 1) {
      const isMajor = i % 5 === 0;
      const angle = startAngle + (i / 20) * (endAngle - startAngle);
      const rad = ((angle - 90) * Math.PI) / 180;
      const rIn = isMajor ? 65 : 72;
      const rOut = 78;
      lines.push({
        x1: center + Math.cos(rad) * rIn,
        y1: center + Math.sin(rad) * rIn,
        x2: center + Math.cos(rad) * rOut,
        y2: center + Math.sin(rad) * rOut,
        stroke: isMajor ? "#475569" : "#334155",
        strokeWidth: isMajor ? 2 : 1,
      });
    }
    return lines;
  }, []);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${size} ${size}`}>
      <path
        d={describeArc(center, center, 80, startAngle, endAngle)}
        fill="none"
        stroke="#1f2937"
        strokeWidth="12"
      />

      {zones.map((zone, idx) => {
        const zStart =
          startAngle + ((zone.start - min) / (max - min || 1)) * (endAngle - startAngle);
        const zEnd =
          startAngle + ((zone.end - min) / (max - min || 1)) * (endAngle - startAngle);
        return (
          <path
            key={`${zone.start}-${zone.end}-${idx}`}
            d={describeArc(center, center, 80, zStart, zEnd)}
            fill="none"
            stroke={zone.color}
            strokeWidth="12"
          />
        );
      })}

      <g>
        {tickLines.map((line, idx) => (
          <line key={`tick-${idx}`} {...line} />
        ))}
      </g>

      <g
        style={{
          transformOrigin: `${center}px ${center}px`,
          transform: `rotate(${needleAngle - 90}deg)`,
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <path
          d={`M ${center - 2} ${center} L ${center} 30 L ${center + 2} ${center} Z`}
          fill={color}
        />
        <circle
          cx={center}
          cy={center}
          r="4"
          fill="#0f172a"
          stroke={color}
          strokeWidth="2"
        />
      </g>

      {showValue && (
        <>
          <text
            x={center + Number(valueOffsetX || 0)}
            y={center + 45 + Number(valueOffsetY || 0)}
            textAnchor="middle"
            fill={valueColor}
            fontSize="22"
            fontWeight="800"
            fontFamily="monospace"
          >
            {safeValue.toFixed(1)}
          </text>
          {showLabel && (
            <text
              x={center + Number(unitOffsetX || 0)}
              y={center + 60 + Number(unitOffsetY || 0)}
              textAnchor="middle"
              fill={unitColor}
              fontSize="9"
              fontWeight="700"
              fontFamily="monospace"
            >
              {unit}
            </text>
          )}
        </>
      )}
    </svg>
  );
};

export default HmiScadaGauge;
