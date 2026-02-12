import React from "react";

/**
 * Bloque skeleton básico para placeholders de listas o tarjetas.
 * width/height aceptan cualquier clase tailwind (w-48, h-6, etc.).
 */
const SkeletonBlock = ({ width = "w-full", height = "h-4", rounded = "rounded-md" }) => (
  <div
    className={`animate-pulse bg-slate-200 ${width} ${height} ${rounded} shadow-inner`}
    aria-hidden="true"
  />
);

export default SkeletonBlock;