import React from "react";
import RingGauge from "./RingGauge";

export default function MiniRingWidget({
  percent,
  formattedValue,
  unit,
  label,
  ...style
}) {
  return (
    <div
      className="scada-mini-widget"
      style={{ backgroundColor: style.backgroundColor }}
    >
      <div
        className="scada-mini-title"
        style={{ color: style.textColor }}
      >
        {label}
      </div>

      <RingGauge
        percent={percent}
        displayValue={formattedValue}
        unit={unit}
        {...style}
      />
    </div>
  );
}