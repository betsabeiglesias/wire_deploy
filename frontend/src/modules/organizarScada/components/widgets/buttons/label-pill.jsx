import React from "react";

/**
 * Convierte HEX a RGBA con alpha
 */
const hexToRgba = (hex, alpha = 1) => {
  if (!hex || !hex.startsWith("#")) return hex;

  let r = 0, g = 0, b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const LabelPill = ({ label = "Label", theme, width, height }) => {
  const color = theme?.colors?.success || "#10b981";

  // 👇 ESCALA DINÁMICA igual que botones
  const fontSize = Math.max(9, Math.min(width, height) * 0.16);
  const paddingX = Math.max(6, width * 0.08);
  const paddingY = Math.max(2, height * 0.12);

  const baseStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999, // pill total
    fontSize,
    fontWeight: 600,
    userSelect: "none",
    transition: "all 0.15s ease",
    padding: `${paddingY}px ${paddingX}px`,
  };

  const styles = {
    color,
    border: `1px solid ${color}`,
    backgroundColor: hexToRgba(color, 0.15),
  };

  return (
    <div style={{ ...baseStyle, ...styles }}>
      {label}
    </div>
  );
};

export default {
  type: "label-pill",

  component: LabelPill,

  buildProps: ({ settings, width, height }) => ({
    label: settings?.label || "Label",
    width,
    height,
  }),

  resolveStyle: () => ({}),
};