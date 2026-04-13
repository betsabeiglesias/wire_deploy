import React from "react";
import BooleanLamp from "./BooleanLamp";

export default function MiniLampWidget({ active, label }) {
  return (
    <div className="scada-mini-widget">
      <div className="scada-mini-title">{label}</div>
      <BooleanLamp active={active} />
    </div>
  );
}
