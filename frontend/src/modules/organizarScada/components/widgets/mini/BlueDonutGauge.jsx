import React from "react";

export default function BlueDonutGauge({ percent, label }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="mini-gauge donut-gauge">
      <svg viewBox="0 0 160 160">
        <circle className="donut-track" cx="80" cy="80" r={radius}></circle>
        <circle
          className="donut-progress"
          cx="80"
          cy="80"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        ></circle>
      </svg>
      <div className="donut-value">{label}</div>
    </div>
  );
}
