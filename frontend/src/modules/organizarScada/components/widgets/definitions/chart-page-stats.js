import ChartPageStats from "../iconsScada/ChartPageStats";

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

  resolveStyle() {
    return {};
  },

  component: ChartPageStats,
};
