import React from "react";

/**
 * Convierte cualquier color HEX a rgba con alpha
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

const LabelPill = ({ label = "Label", theme }) => {
  const color = theme?.colors?.success || "#10b981";

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-full border text-[11px] px-3 py-1"
      style={{
        color: color,
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.15), // 👈 aquí está la clave
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "label-pill",

  component: ({ label, theme }) => (
    <LabelPill label={label} theme={theme} />
  ),

  buildProps: ({ settings }) => ({
    label: settings?.label || "Label",
  }),

  resolveStyle: () => ({}),
};