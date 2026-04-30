import React from "react";

const CardElevated = ({ label = "Card", theme, width, height }) => {
  const borderColor = theme?.colors?.border || "#e5e7eb";
  const bg = theme?.colors?.bgWidget || "#ffffff";

  // 📐 misma regla de escala que el resto del sistema
  const scale = Math.min(width, height) / 100;

  const fontSize = 10 + scale * 6;
  const padding = 6 + scale * 10;
  const borderRadius = (theme?.radius || 8) * scale;

  const shadowY = 2 + scale * 6;
  const shadowBlur = 6 + scale * 10;

  const style = {
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius,
    border: `1px solid ${borderColor}`,
    backgroundColor: bg,

    padding,
    fontSize,
    fontWeight: 500,

    boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.12)`,

    boxSizing: "border-box",
    userSelect: "none",

    transition: "all 0.15s ease",
  };

  return <div style={style}>{label}</div>;
};

export default {
  type: "card-elevated",
  component: CardElevated,

  buildProps: ({ settings, width, height }) => ({
    label: settings?.label || "Card",
    width,
    height,
  }),

  resolveStyle: () => ({}),
};