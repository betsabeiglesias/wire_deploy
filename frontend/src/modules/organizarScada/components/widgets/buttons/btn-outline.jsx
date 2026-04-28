import React from "react";

const BtnOutline = ({ label = "Button", theme }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme?.radius || 6,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${theme.colors.primary}`,
        color: theme.colors.primary,
        background: "transparent",
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "btn-outline",
  component: BtnOutline,
  buildProps: ({ settings }) => ({
    label: settings?.label || "Button",
  }),
  resolveStyle: () => ({}),
};