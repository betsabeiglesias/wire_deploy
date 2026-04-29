import React from "react";
import NeedleGauge from "./NeedleGauge";

export default function MiniNeedleWidget({
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

      <NeedleGauge
        percent={percent}
        value={formattedValue}
        unit={unit}
        {...style}
      />
    </div>
  );
}