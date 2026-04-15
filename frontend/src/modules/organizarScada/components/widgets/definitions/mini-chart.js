import MiniTrendChart from "../mini/MiniTrendChart";

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

  resolveStyle() {
    return {};
  },

  component: MiniTrendChart,
};
