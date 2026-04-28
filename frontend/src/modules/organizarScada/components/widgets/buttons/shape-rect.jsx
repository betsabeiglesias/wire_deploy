import React from "react";

const ShapeRect = ({ theme }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: `2px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.bgPreview,
        borderRadius: 6,
      }}
    />
  );
};

export default {
  type: "shape-rect",
  component: ShapeRect,
  buildProps: () => ({}),
  resolveStyle: () => ({}),
};