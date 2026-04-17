import React from "react";

const HmiEnergySummaryCard = ({
  title = "Consumo Energetico 2026",
  value = "1.627.009,26",
  unit = "kWh",
  subtitle = "Electric Energy",
  deltaText = "Alto nivel de consumo en este mes",
  deltaValue = "2%",
  deltaDirection = "up",
  width = 380,
  height = 140,

  // 👇 NUEVO (IMPORTANTE)
  backgroundColor = "#ffffff",
  textColor = "#0f172a",
  primaryColor = "#3b82f6",
  secondaryColor = "#94a3b8",
}) => {
  const arrowColor = deltaDirection === "down" ? "#10b981" : "#ef4444";
  const arrow = deltaDirection === "down" ? "▼" : "▲";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 380 140"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Fondo */}
      <rect
        x="1"
        y="1"
        width="378"
        height="138"
        rx="12"
        fill={backgroundColor}
        stroke={secondaryColor}
      />

      {/* Header */}
      <rect
        x="1"
        y="1"
        width="378"
        height="34"
        rx="12"
        fill={secondaryColor}
        opacity="0.15"
      />

      <text x="16" y="22" fontSize="12" fill={textColor}>
        {title}
      </text>

      {/* Círculo unidad */}
      <circle cx="55" cy="72" r="30" fill={primaryColor} />

      <text
        x="55"
        y="76"
        fontSize="14"
        fill="#ffffff"
        fontWeight="700"
        textAnchor="middle"
      >
        {unit}
      </text>

      {/* Valor */}
      <text
        x="135"
        y="70"
        fontSize="24"
        fill={textColor}
        fontWeight="700"
      >
        {value}
      </text>

      <text x="135" y="90" fontSize="12" fill={secondaryColor}>
        {subtitle}
      </text>

      <line x1="16" y1="103" x2="364" y2="103" stroke={secondaryColor} />

      <text x="16" y="122" fontSize="11" fill={secondaryColor}>
        {deltaText}
      </text>

      <text x="315" y="122" fontSize="12" fill={arrowColor}>
        {arrow} {deltaValue}
      </text>
    </svg>
  );
};

export default HmiEnergySummaryCard;