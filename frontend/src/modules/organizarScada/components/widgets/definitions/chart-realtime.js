import ChartRealtime from "../iconsScada/ChartRealtime";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "chart-realtime",
  label:       "Grafica Realtime",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 340, h: 200 },

  buildProps({ settings, width, height }) {
    return {
      settings,
      width,
      height,
    };
  },

  styleSchema: [],

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

  component: ChartRealtime,
};
