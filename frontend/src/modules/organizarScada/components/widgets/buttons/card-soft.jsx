import React from "react";

const CardSoft = ({ label = "Card", theme }) => {
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
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "card-soft",
  component: CardSoft,
  buildProps: ({ settings }) => ({
    label: settings?.label || "Card",
  }),
  resolveStyle: () => ({}),
};