import React from "react";

const NavButton = ({
  label = "Button",
  variant = "btn-primary",
  theme,
}) => {
  const isOutline  = variant === "btn-outline";
  const isInverted = variant === "btn-inverted"; // 👈 NUEVO

  const primary = theme?.colors?.primary || "#2563eb";

  const baseStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme?.radius || 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s ease",
  };

  let styles = {};

  if (isInverted) {
    // ✅ TU CASO: blanco + azul
    styles = {
      backgroundColor: "#ffffff",
      color: primary,
      border: `1px solid ${primary}`,
    };
  } else if (isOutline) {
    styles = {
      backgroundColor: "transparent",
      color: primary,
      border: `1px solid ${primary}`,
    };
  } else {
    styles = {
      backgroundColor: primary,
      color: "#ffffff",
      border: "none",
    };
  }

  return (
    <div style={{ ...baseStyle, ...styles }}>
      {label}
    </div>
  );
};

export default {
  type: "nav-button",

  component: NavButton,

  buildProps: ({ settings }) => ({
    label: settings?.label || "Button",
    variant: settings?.variant || "btn-primary",
  }),

  resolveStyle: () => ({}),
};