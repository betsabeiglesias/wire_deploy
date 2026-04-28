import React from "react";

const ShapeRect = ({ theme, width, height }) => {
  const borderColor = theme?.colors?.border || "#e5e7eb";
  const bg = theme?.colors?.bgPreview || "#f3f4f6";

  const borderWidth = Math.max(1, Math.min(width, height) * 0.4);
  const borderRadius = Math.min(width, height) * 0.1;

  return (
    <div
      style={{
        marginTop: 6,
        marginRight: 16,

        width: "100%",
        height: "100%",

        display: "block",

        border: `${borderWidth}px solid ${borderColor}`,
        backgroundColor: bg,
        borderRadius,

        boxSizing: "border-box",
      }}
    />
  );
};

export default {
  type: "shape-rect",

  component: ShapeRect,

  buildProps: ({ settings, width, height }) => ({
    width,
    height,
  }),

  resolveStyle: () => ({}),
};