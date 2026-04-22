import MiniBubbleWidget from "../mini/MiniBubbleWidget";
import { buildNumericMiniProps } from "./_shared";
import { buildBaseStyle } from "./_shared";

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

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      textColor: base.titleColor,

      gridColor: base.gridColor,
      axisColor: base.axisColor,

      primaryColor: base.primary,
      secondaryColor: base.primaryDark,
    };
  },

  component: MiniBubbleWidget,
};
