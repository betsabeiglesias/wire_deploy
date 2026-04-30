import React from "react";

export default function RingGauge({
  percent,
  displayValue,
  unit,
  primaryColor = "#00b894",
  secondaryColor = "#dfe6e9",
}) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="mini-gauge ring-gauge">
      <svg viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke={secondaryColor} fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={primaryColor}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="ring-value" style={{ color: primaryColor }}>
        {displayValue}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}