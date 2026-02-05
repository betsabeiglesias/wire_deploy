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
      <rect x="1" y="1" width="378" height="138" rx="12" fill="#ffffff" stroke="#e5e7eb" />
      <rect x="1" y="1" width="378" height="34" rx="12" fill="#f3f4f6" />
      <rect x="1" y="23" width="378" height="12" fill="#f3f4f6" />

      <text x="16" y="22" fontSize="12" fill="#6b7280" fontFamily="Arial, sans-serif">
        {title}
      </text>
      <circle cx="55" cy="72" r="30" fill="#5b8dbb" />
      <text
        x="55"
        y="76"
        fontSize="14"
        fill="#ffffff"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        {unit}
      </text>

      <text
        x="135"
        y="70"
        fontSize="24"
        fill="#4f83b6"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        {value}
      </text>
      <text x="135" y="90" fontSize="12" fill="#6b7280" fontFamily="Arial, sans-serif">
        {subtitle}
      </text>

      <line x1="16" y1="103" x2="364" y2="103" stroke="#e5e7eb" strokeWidth="1" />

      <text x="16" y="122" fontSize="11" fill="#6b7280" fontFamily="Arial, sans-serif">
        {deltaText}
      </text>
      <text x="315" y="122" fontSize="12" fill={arrowColor} fontFamily="Arial, sans-serif">
        {arrow} {deltaValue}
      </text>
    </svg>
  );
};

export default HmiEnergySummaryCard;
