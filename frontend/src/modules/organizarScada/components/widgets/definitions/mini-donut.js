import MiniDonutWidget from "../mini/MiniDonutWidget";
import { buildNumericMiniProps } from "./_shared";

export default {
  type:        "mini-donut",
  label:       "Donut Gauge",
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
      fields: [{ key: "primary", label: "Color donut", type: "color" }],
    },
  ],

  resolveStyle(palette) {
    return { primary: palette.primary || "#3b82f6" };
  },

  component: MiniDonutWidget,
};
