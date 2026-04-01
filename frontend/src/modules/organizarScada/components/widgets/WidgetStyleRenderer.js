// src/modules/organizarScada/components/widgets/WidgetStyleRenderer.js


export const resolveWidgetStyle = (type, settings) => {
  const palette = settings?.style?.palette || {};

  const base = {
    primary: palette.primary || settings.color || "#3b82f6",
    secondary: palette.secondary || "#94a3b8",
    text: palette.text || "#ffffff",
    unit: palette.unit || "#94a3b8",
    label: palette.label || "#e2e8f0",
    mode: settings?.style?.mode || "solid", 
  };

  switch (type) {
    case "hmi-scada-gauge":
      return {
        arcColor: base.primary,
        needleColor: base.primary,
        tickColor: base.secondary,
        valueColor: base.text,
        unitColor: base.unit,
      };

    case "temp-gauge":
    if (base.mode === "solid") {
        return {
        arcStartColor: base.primary,
        arcMidColor: base.primary,
        arcEndColor: base.primary,
        valueColor: base.text,
        labelColor: base.label,
        };
    }

    if (base.mode === "zones") {
        return {
        arcStartColor: "#22c55e",
        arcMidColor: "#facc15",
        arcEndColor: "#ef4444",
        valueColor: base.text,
        labelColor: base.label,
        };
    }

    case "hmi-progress-bar":
      return {
        gradientFrom: base.primary,
        gradientTo: base.secondary,
        labelColor: base.text,
      };

    case "hmi-tank-level":
      return {
        fluidBase: base.primary,
        gradientFrom: base.primary,
        gradientTo: base.secondary,
        labelColor: base.text,
      };

    case "energy-bar-chart":
      return {
        barGradientFrom: base.primary,
        limitColor: base.secondary,
        labelColor: base.text,
      };

    default:
      return base;
  }
};