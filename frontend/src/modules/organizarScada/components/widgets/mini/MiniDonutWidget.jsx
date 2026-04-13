import React from "react";
import BlueDonutGauge from "./BlueDonutGauge";

export default function MiniDonutWidget({ percent, labelText, label, ...style }) {
  return (
    <div className="scada-mini-widget">
      <div className="scada-mini-title">{label}</div>
      <BlueDonutGauge percent={percent} label={labelText} {...style} />
    </div>
  );
}
