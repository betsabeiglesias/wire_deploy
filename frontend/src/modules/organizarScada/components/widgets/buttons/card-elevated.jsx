import React from "react";

const CardElevated = ({ label = "Card", theme }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: theme.radius || 8,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.bgWidget,
        padding: 8,
        fontSize: 11,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "card-elevated",
  component: CardElevated,
  buildProps: ({ settings }) => ({
    label: settings?.label || "Card",
  }),
  resolveStyle: () => ({}),
};