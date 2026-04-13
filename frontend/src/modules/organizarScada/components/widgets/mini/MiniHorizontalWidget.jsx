import React from "react";
import MiniHorizontalBar from "./MiniHorizontalBar";

export default function MiniHorizontalWidget({ percent, labelText, label, ...style }) {
  return (
    <div className="scada-mini-widget">
      <div className="scada-mini-title">{label}</div>
      <MiniHorizontalBar percent={percent} label={labelText} {...style} />
    </div>
  );
}
