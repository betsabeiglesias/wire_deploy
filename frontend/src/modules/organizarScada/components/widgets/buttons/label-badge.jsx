import React from "react";

const LabelBadge = ({ label = "Badge", theme, width, height }) => {
  const bg = theme?.colors?.textMain || "#111827";
  const fg = theme?.colors?.bgWidget || "#ffffff";

  // 👇 ESCALA CONSISTENTE con resto del sistema
  const fontSize = Math.max(8, Math.min(width, height) * 0.14);
  const paddingX = Math.max(4, width * 0.06);
  const paddingY = Math.max(2, height * 0.12);
  const borderRadius = Math.max(3, Math.min(width, height) * 0.08);

  const style = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize,
    fontWeight: 700,
    textTransform: "uppercase",
    userSelect: "none",

    padding: `${paddingY}px ${paddingX}px`,
    borderRadius,

    backgroundColor: bg,
    color: fg,
  };

  return <div style={style}>{label}</div>;
};

export default {
  type: "label-badge",
  component: LabelBadge,

  buildProps: ({ settings, width, height }) => ({
    label: settings?.label || "Badge",
    width,
    height,
  }),

  resolveStyle: () => ({}),
};