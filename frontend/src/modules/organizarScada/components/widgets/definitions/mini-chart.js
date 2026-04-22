import MiniTrendChart from "../mini/MiniTrendChart";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "mini-chart",
  label:       "Mini Grafica",
  category:    "minis",
  icon:        "chart",
  defaultSize: { w: 220, h: 140 },

  buildProps({ settings }) {
    return {
      series: settings.series || [],
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

  component: MiniTrendChart,
};
