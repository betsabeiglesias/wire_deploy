import React from "react";

export default function ValueBubble({
  value,
  unit,
  primaryColor = "#00b894",
  textColor = "#fff",
}) {
  return (
    <div
      className="mini-gauge value-bubble"
      style={{ background: primaryColor, color: textColor }}
    >
      <div className="bubble-body">
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}