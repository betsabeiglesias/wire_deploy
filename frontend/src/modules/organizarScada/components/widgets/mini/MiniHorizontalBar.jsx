import React from "react";

export default function MiniHorizontalBar({
  percent,
  label,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundColor,
}) {
  return (
    <div
      className="mini-gauge horizontal-gauge"
      style={{ backgroundColor }}
    >
      <div
        className="mini-bar-track"
        style={{ backgroundColor: secondaryColor }}
      >
        <div
          className="mini-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: primaryColor,
          }}
        ></div>
      </div>

      <div
        className="mini-bar-label"
        style={{ color: textColor }}
      >
        {label}
      </div>
    </div>
  );
}