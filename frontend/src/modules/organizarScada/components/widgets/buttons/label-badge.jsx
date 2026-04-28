import React from "react";

const LabelBadge = ({ label = "Badge", theme }) => {
  return (
    <div
      style={{
        padding: "2px 8px",
        fontSize: 10,
        textTransform: "uppercase",
        borderRadius: 4,
        backgroundColor: theme.colors.textMain,
        color: theme.colors.bgWidget,
      }}
    >
      {label}
    </div>
  );
};

export default {
  type: "label-badge",
  component: LabelBadge,
  buildProps: ({ settings }) => ({
    label: settings?.label || "Badge",
  }),
  resolveStyle: () => ({}),
};