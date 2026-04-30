import React from "react";

const NavButton = ({
  label = "Button",
  variant = "btn-primary",
  theme,
  width,
  height,
}) => {
  const primary = theme?.colors?.primary || "#2563eb";

  // 👇 ESCALA DINÁMICA (clave)
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

  const styles =
    variant === "btn-primary"
      ? {
          backgroundColor: primary,
          color: "#ffffff",
          border: "none",
        }
      : {
          backgroundColor: "#ffffff",
          color: primary,
          border: `${Math.max(1, fontSize * 0.08)}px solid ${primary}`, // 👈 borde proporcional
        };

  return (
    <div style={{ ...baseStyle, ...styles }}>
      {label}
    </div>
  );
};

export default {
  type: "nav-button",

  component: NavButton,

  buildProps: ({ settings, width, height }) => ({
    label: settings?.label || "Button",
    variant: settings?.variant || "btn-primary",
    width,
    height,
  }),

  resolveStyle: () => ({}),
};