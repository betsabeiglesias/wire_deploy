// widgets/buttons/btn-primary.jsx
import React from "react";

const BtnPrimary = ({ label = "Button", theme }) => {
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
        backgroundColor: theme.colors.primary,
        color: "#fff",
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "btn-primary",
  component: BtnPrimary,
  buildProps: ({ settings }) => ({
    label: settings?.label || "Button",
  }),
  resolveStyle: () => ({}),
};