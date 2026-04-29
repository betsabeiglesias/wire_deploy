import React from "react";

export default function BooleanLamp({
  active,
  label,

  // 👇 theme
  backgroundColor,
  textColor,
  primaryColor,
  secondaryColor,
}) {
  return (
    <div
      className="mini-gauge boolean-lamp"
      style={{
        background: secondaryColor,
        color: textColor,
      }}
    >
      <div
        className={`lamp ${active ? "on" : "off"}`}
        style={{
          background: active ? primaryColor : secondaryColor,
          boxShadow: active
            ? `0 0 8px ${primaryColor}`
            : `0 0 4px ${secondaryColor}`,
        }}
      />

      <div
        className="mini-bar-label"
        style={{ color: textColor }}
      >
        {active ? "OK" : "FALLO"}
      </div>
    </div>
  );
}