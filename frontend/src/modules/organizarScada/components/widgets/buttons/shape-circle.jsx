import React from "react";

const ShapeCircle = ({ theme, width, height }) => {
  const borderColor = theme?.colors?.border || "#e5e7eb";
  const bg = theme?.colors?.bgPreview || "#f3f4f6";

  // 📐 misma lógica base que estás usando en rect
  const size = Math.min(width, height);

  const borderWidth = Math.max(1, size * 0.5);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",

        margin: 8,
        marginRight: 16,

        borderRadius: "50%",

        border: `${borderWidth}px solid ${borderColor}`,
        backgroundColor: bg,

        boxSizing: "border-box",
      }}
    />
  );
};

export default {
  type: "shape-circle",

  component: ShapeCircle,

  buildProps: ({ settings, width, height }) => ({
    width,
    height,
  }),

  resolveStyle: () => ({}),
};