import React from "react";
import BlueDonutGauge from "./BlueDonutGauge";

export default function MiniDonutWidget({
  percent,
  labelText,
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

      <BlueDonutGauge
        percent={percent}
        label={labelText}
        {...style}
      />
    </div>
  );
}