import React from "react";

export default function BooleanLamp({ active }) {
  return (
    <div className="mini-gauge boolean-lamp">
      <div className={`lamp ${active ? "on" : "off"}`}></div>
      <div className="mini-bar-label">{active ? "OK" : "FALLO"}</div>
    </div>
  );
}
