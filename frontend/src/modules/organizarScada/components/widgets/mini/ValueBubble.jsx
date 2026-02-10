import React from "react";

export default function ValueBubble({ value, unit }) {
  return (
    <div className="mini-gauge value-bubble">
      <div className="bubble-body">
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}
