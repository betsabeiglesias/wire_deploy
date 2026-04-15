import React from "react";
import RingGauge from "./RingGauge";

export default function MiniRingWidget({ percent, formattedValue, unit, label }) {
  return (
    <div className="scada-mini-widget">
      <div className="scada-mini-title">{label}</div>
      <RingGauge percent={percent} displayValue={formattedValue} unit={unit} />
    </div>
  );
}
