import React from "react";
import { WIDGET_REGISTRY } from "./index";

const WIDGET_PALETTE = {
  primary: "#29468B",
  secondary: "#2A8B4B",
  text: "#1E293B",
  bg: "#FFFFFF",
  border: "#CBD5E1",
};

export const renderWidget = ({
  data,
  live = {},
  width,
  height,
  valueHistory,
  demoNow,
}) => {
  if (!data) return null;

  const definition = WIDGET_REGISTRY[data.type];

  if (!definition) {
    const fallbackLabel = data.settings?.label || data.settings?.attributeLabel || data.label || "";
    return <div className="p-2 text-xs">{fallbackLabel}</div>;
  }

  const settings = data.settings || {};
  const dynamicPalette = {
    ...WIDGET_PALETTE,
    ...(settings.style?.palette || {}),
  };

  const mode = settings.style?.mode;
  const styleProps = definition.resolveStyle(dynamicPalette, mode);
  const widgetProps = definition.buildProps({
    settings,
    live,
    width,
    height,
    valueHistory,
    demoNow,
  });
  const Component = definition.component;

  return <Component {...widgetProps} {...styleProps} />;
};
