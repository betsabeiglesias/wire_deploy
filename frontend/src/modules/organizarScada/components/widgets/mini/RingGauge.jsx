import React from "react";

export default function RingGauge({ percent, displayValue, unit }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="mini-gauge ring-gauge">
      <svg viewBox="0 0 140 140">
        <circle className="ring-track" cx="70" cy="70" r={radius}></circle>
        <circle
          className="ring-progress"
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        ></circle>
      </svg>
      <div className="ring-value">
        {displayValue}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}
