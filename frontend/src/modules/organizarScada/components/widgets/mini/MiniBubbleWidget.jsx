import React from "react";
import ValueBubble from "./ValueBubble";

export default function MiniBubbleWidget({ bubbleValue, unit, label, ...style }) {
  return (
    <div className="scada-mini-widget">
      <div className="scada-mini-title">{label}</div>
      <ValueBubble value={bubbleValue} unit={unit} {...style} />
    </div>
  );
}
