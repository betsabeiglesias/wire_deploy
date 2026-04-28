import React from "react";

const ShapeTriangle = ({ theme }) => {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "20px solid transparent",
        borderRight: "20px solid transparent",
        borderBottom: `40px solid ${theme.colors.border}`,
        margin: "auto",
      }}
    />
  );
};

export default {
  type: "shape-triangle",
  component: ShapeTriangle,
  buildProps: () => ({}),
  resolveStyle: () => ({}),
};