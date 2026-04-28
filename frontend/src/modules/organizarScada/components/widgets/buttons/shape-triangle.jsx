import React from "react";

const ShapeTriangle = ({ theme, width, height }) => {
  const color = theme?.colors?.border || "#e5e7eb";

  // 📐 misma lógica que el resto de shapes
  const size = Math.min(width, height);

  const halfBase = Math.max(2, size * 0.4);
  const heightTri = Math.max(4, size * 0.8);

  return (
    <div
      style={{
        width: 0,
        height: 0,

        margin: 6,
        marginLeft: 32,

        borderLeft: `${halfBase}px solid transparent`,
        borderRight: `${halfBase}px solid transparent`,
        borderBottom: `${heightTri}px solid ${color}`,
      }}
    />
  );
};

export default {
  type: "shape-triangle",

  component: ShapeTriangle,

  buildProps: ({ settings, width, height }) => ({
    width,
    height,
  }),

  resolveStyle: () => ({}),
};