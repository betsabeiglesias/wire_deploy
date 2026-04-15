import MiniNeedleWidget from "../mini/MiniNeedleWidget";
import { buildNumericMiniProps } from "./_shared";

export default {
  type:        "mini-needle",
  label:       "Aguja",
  category:    "minis",
  icon:        "gauge",
  defaultSize: { w: 120, h: 120 },

  buildProps({ settings, live }) {
    const label = settings.attributeLabel || settings.label || "";
    return { ...buildNumericMiniProps(settings, live), label };
  },

  styleSchema: [
    {
      group: "General",
      fields: [{ key: "primary", label: "Color aguja", type: "color" }],
    },
  ],

  resolveStyle(palette) {
    return { primary: palette.primary || "#3b82f6" };
  },

  component: MiniNeedleWidget,
};
