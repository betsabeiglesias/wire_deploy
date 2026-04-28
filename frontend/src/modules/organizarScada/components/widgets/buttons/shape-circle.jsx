import React from "react";

const ShapeCircle = ({ theme }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `2px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.bgPreview,
      }}
    />
  );
};

export default {
  type: "shape-circle",
  component: ShapeCircle,
  buildProps: () => ({}),
  resolveStyle: () => ({}),
};