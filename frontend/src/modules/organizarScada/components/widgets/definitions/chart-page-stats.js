import ChartPageStats from "../iconsScada/ChartPageStats";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "chart-page-stats",
  label:       "Grafica Page Stats",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 360, h: 240 },

  buildProps({ settings, width, height }) {
    return {
      series: settings.series,
      options: settings.options,
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

  component: ChartPageStats,
};
