import MiniBubbleWidget from "../mini/MiniBubbleWidget";
import { buildNumericMiniProps } from "./_shared";

export default {
  type:        "mini-bubble",
  label:       "Burbuja de Valor",
  category:    "minis",
  icon:        "gauge",
  defaultSize: { w: 100, h: 100 },

  buildProps({ settings, live }) {
    const label = settings.attributeLabel || settings.label || "";
    return { ...buildNumericMiniProps(settings, live), label };
  },

  styleSchema: [
    {
      group: "General",
      fields: [
        { key: "primary", label: "Color fondo", type: "color" },
        { key: "text",    label: "Color texto", type: "color" },
      ],
    },
  ],

  resolveStyle(palette) {
    return {
      primary: palette.primary || "#3b82f6",
      text:    palette.text    || "#ffffff",
    };
  },

  component: MiniBubbleWidget,
};
