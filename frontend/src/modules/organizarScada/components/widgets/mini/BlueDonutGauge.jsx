import React from "react";

export default function BlueDonutGauge({
  percent,
  label,

  // 👇 theme props
  backgroundColor,
  textColor,
  primaryColor,
  secondaryColor,
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="mini-gauge donut-gauge"
      style={{
        background: backgroundColor,
        color: textColor,
      }}
    >
      <svg viewBox="0 0 160 160">
        {/* 👇 NO quitamos clase, solo sobreescribimos */}
        <circle
          className="donut-track"
          cx="80"
          cy="80"
          r={radius}
          style={{
            stroke: secondaryColor,
          }}
        />

        <circle
          className="donut-progress"
          cx="80"
          cy="80"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            stroke: primaryColor,
          }}
        />
      </svg>

      <div
        className="donut-value"
        style={{ color: textColor }}
      >
        {label}
      </div>
    </div>
  );
}