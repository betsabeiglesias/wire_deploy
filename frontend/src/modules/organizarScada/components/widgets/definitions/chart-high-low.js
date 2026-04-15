import ChartHighLow from "../iconsScada/ChartHighLow";

export default {
  type:        "chart-high-low",
  label:       "Grafica High Low",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 320, h: 240 },

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

  component: ChartHighLow,
};
