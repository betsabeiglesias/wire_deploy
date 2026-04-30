// src/modules/organizarScada/components/widgets/registry.jsx
import React from "react";
import { WIDGET_REGISTRY } from "./index";
import { useHmiTheme } from "./styles/ThemeProvider";

export const renderWidget = ({ data, live = {}, width, height, valueHistory, demoNow }) => {
  const { theme } = useHmiTheme();
  
  if (!data) return null;
  const definition = WIDGET_REGISTRY[data.type];

  // Si no hay definición, mostramos un fallback básico
  if (!definition) {
    const fallbackLabel = data.settings?.label || data.label || data.type || "Unknown Widget";
    return <div className="p-2 text-xs opacity-50">{fallbackLabel}</div>;
  }

  const settings = data.settings || {};
  
  // Paleta dinámica unificada para TODO tipo de widget/botón
  const dynamicPalette = {
    primary: theme.colors.primary,
    secondary: theme.colors.success,
    text: theme.colors.textMain,
    bg: theme.colors.bgWidget,
    border: theme.colors.border,
    ...(settings.style?.palette || {}) 
  };

  const mode = settings.style?.mode;
  
  // Resolvemos estilos y props según la definición del componente
  const styleProps = definition.resolveStyle(dynamicPalette, mode);
  const widgetProps = definition.buildProps({ settings, live, width, height, valueHistory, demoNow });
  const Component = definition.component;

  return <Component {...widgetProps} {...styleProps} theme={theme} />;
};