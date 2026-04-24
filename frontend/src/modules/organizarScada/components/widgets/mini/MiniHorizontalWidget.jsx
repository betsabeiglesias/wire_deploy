import React from "react";
import MiniHorizontalBar from "./MiniHorizontalBar";

export default function MiniHorizontalWidget({
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

      <MiniHorizontalBar
        percent={percent}
        label={labelText}
        {...style}
      />
    </div>
  );
}