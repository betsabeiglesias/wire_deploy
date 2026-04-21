// C:\Users\aroa.banuelos\Desktop\wire_deploy\frontend\src\modules\organizarScada\components\widgets\registry.jsx

import React from "react";
import { WIDGET_REGISTRY } from "./index";
import { useHmiTheme } from "./styles/ThemeProvider"; // <--- Importamos el hook

export const renderWidget = ({ data, live = {}, width, height, valueHistory, demoNow }) => {
  const { theme } = useHmiTheme(); // <--- Accedemos al tema actual (Cyber, Forest, etc.)
  
  if (!data) return null;
  const definition = WIDGET_REGISTRY[data.type];

  if (!definition) {
    const fallbackLabel = data.settings?.label || data.settings?.attributeLabel || data.label || "";
    return <div className="p-2 text-xs">{fallbackLabel}</div>;
  }

  const settings = data.settings || {};
  
  // ─────────────────────────────────────────────────────────────
  // EL TRUCO: Creamos una paleta dinámica basada en el tema activo
  // ─────────────────────────────────────────────────────────────
  const dynamicPalette = {
    primary: theme.colors.primary,
    secondary: theme.colors.success, // o el que prefieras como secundario
    text: theme.colors.textMain,
    bg: theme.colors.bgWidget,
    border: theme.colors.border,
    // Si el widget tiene colores personalizados en settings, los mantenemos,
    // pero si no, usamos los del tema.
    ...(settings.style?.palette || {}) 
  };

  const mode = settings.style?.mode;
  
  // Ahora resolveStyle recibe los colores del tema en tiempo real
  const styleProps = definition.resolveStyle(dynamicPalette, mode);
  
  const widgetProps = definition.buildProps({ settings, live, width, height, valueHistory, demoNow });
  const Component = definition.component;

  // Pasamos el theme completo por si el componente interno lo necesita
  return <Component {...widgetProps} {...styleProps} theme={theme} />;
};