// widgets/buttons/btn-primary.jsx
import React from "react";

const BtnPrimary = ({ label = "Button", theme, width, height }) => {
  const primary = theme?.colors?.primary || "#2563eb";

  // 👇 ESCALA DINÁMICA (igual que NavButton)
  const fontSize = Math.max(10, Math.min(width, height) * 0.18);
  const borderRadius = Math.min(width, height) * 0.12;

  const baseStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius,
    fontSize,
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s ease",
  };

  const styles = {
    backgroundColor: primary,
    color: "#ffffff",
    border: "none",
  };

  return (
    <div style={{ ...baseStyle, ...styles }}>
      {label}
    </div>
  );
};

export default {
  type: "btn-primary",
  component: BtnPrimary,

  buildProps: ({ settings, width, height }) => ({
    label: settings?.label || "Button",
    width,
    height,
  }),

  resolveStyle: () => ({}),
};