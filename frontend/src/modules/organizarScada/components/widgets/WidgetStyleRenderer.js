// WidgetStyleRenderer.js
// Delega en la definición del widget del WIDGET_REGISTRY.
// Consumido por registry.jsx internamente — no se usa fuera de widgets/.

import { WIDGET_REGISTRY } from "./index";

const FALLBACK_PALETTE = {
  primary:   "#3b82f6",
  secondary: "#94a3b8",
  text:      "#ffffff",
  unit:      "#94a3b8",
  label:     "#e2e8f0",
};

export const resolveWidgetStyle = (type, settings) => {
  const palette    = settings?.style?.palette || {};
  const mode       = settings?.style?.mode;
  const definition = WIDGET_REGISTRY[type];

  if (definition?.resolveStyle) {
    return definition.resolveStyle(palette, mode);
  }

  return { ...FALLBACK_PALETTE, ...palette, mode: mode || "solid" };
};
