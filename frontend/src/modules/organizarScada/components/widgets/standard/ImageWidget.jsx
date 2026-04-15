// widgets/standard/ImageWidget.jsx
// Renderiza una imagen base64 subida por el usuario como icono personalizado.
import React from "react";

export default function ImageWidget({ src, opacity = 100, width, height }) {
  if (!src) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-xs text-slate-400 select-none"
      >
        Sin imagen
      </div>
    );
  }

  return (
    <div
      style={{ width, height, opacity: opacity / 100 }}
      className="flex items-center justify-center overflow-hidden"
    >
      <img
        src={src}
        alt=""
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
        draggable={false}
      />
    </div>
  );
}
