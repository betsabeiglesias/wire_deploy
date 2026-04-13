// widgets/registry.jsx
// Thin adapter: lee del WIDGET_REGISTRY y delega todo en la definición del widget.
// Para añadir un widget nuevo NO se toca este archivo — ver widgets/index.js.

import React from "react";
import { WIDGET_REGISTRY } from "./index";

export const renderWidget = ({ data, live = {}, width, height, valueHistory, demoNow }) => {
  if (!data) return null;

  const definition = WIDGET_REGISTRY[data.type];

  if (!definition) {
    const fallbackLabel = data.settings?.label || data.settings?.attributeLabel || data.label || "";
    return <div className="p-2 text-fg-muted text-xs">{fallbackLabel}</div>;
  }

  const settings    = data.settings || {};
  const palette     = settings.style?.palette || {};
  const mode        = settings.style?.mode;
  const styleProps  = definition.resolveStyle(palette, mode);
  const widgetProps = definition.buildProps({ settings, live, width, height, valueHistory, demoNow });
  const Component   = definition.component;

  return <Component {...widgetProps} {...styleProps} />;
};
