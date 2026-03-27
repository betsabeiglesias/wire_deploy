// src/modules/organizarScada/components/widgets/WidgetStyleRenderer.js

export const resolveWidgetStyle = (settings = {}) => {
  const style = settings.style || {};

  const primary =
    style.primaryColor ||
    settings.color || // 🔥 compatibilidad legacy
    "#3b82f6";

  return {
    primary,
    secondary: style.secondaryColor || primary,
    text: style.textColor || "#ffffff",
    background: style.backgroundColor || "transparent",
    border: style.borderColor || primary,
  };
};