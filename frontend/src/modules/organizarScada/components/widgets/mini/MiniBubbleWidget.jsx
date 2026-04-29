import React from "react";
import ValueBubble from "./ValueBubble";

export default function MiniBubbleWidget({
  bubbleValue,
  unit,
  label,

  // 👇 theme
  backgroundColor,
  textColor,
  primaryColor,
  secondaryColor,
}) {
  return (
    <div
      className="scada-mini-widget"
      style={{
        background: backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="scada-mini-title"
        style={{ color: textColor }}
      >
        {label}
      </div>

      <ValueBubble
        value={bubbleValue}
        unit={unit}
        primaryColor={primaryColor}
        textColor={textColor}
      />
    </div>
  );
}