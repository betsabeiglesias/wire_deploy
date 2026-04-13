import ChartBasic from "../iconsScada/ChartBasic";

export default {
  type:        "chart-basic",
  label:       "Grafica Basica",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 320, h: 240 },

  buildProps({ settings, width, height }) {
    return {
      series: settings.series,
      options: settings.options,
      type: settings.type || "line",
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle() {
    return {};
  },

  component: ChartBasic,
};
