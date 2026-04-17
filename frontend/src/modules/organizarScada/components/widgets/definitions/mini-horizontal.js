import MiniHorizontalWidget from "../mini/MiniHorizontalWidget";
import { buildNumericMiniProps } from "./_shared";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "mini-horizontal",
  label:       "Barra Horizontal",
  category:    "minis",
  icon:        "gauge",
  defaultSize: { w: 140, h: 60 },

  buildProps({ settings, live }) {
    const label = settings.attributeLabel || settings.label || "";
    return { ...buildNumericMiniProps(settings, live), label };
  },

  styleSchema: [
    {
      group: "Barra",
      fields: [{ key: "primary", label: "Color barra", type: "color" }],
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

  component: MiniHorizontalWidget,
};
