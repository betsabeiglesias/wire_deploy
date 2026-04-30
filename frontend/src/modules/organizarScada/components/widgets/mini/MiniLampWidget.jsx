import React from "react";
import BooleanLamp from "./BooleanLamp";

export default function MiniLampWidget({
  active,
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

      <BooleanLamp active={active} {...style} />
    </div>
  );
}