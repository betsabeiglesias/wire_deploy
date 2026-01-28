import React from "react";

export default function MiniHorizontalBar({ percent, label }) {
  return (
    <div className="mini-gauge horizontal-gauge">
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <div className="mini-bar-label">{label}</div>
    </div>
  );
}
