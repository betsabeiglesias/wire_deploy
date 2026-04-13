import ChartRealtime from "../iconsScada/ChartRealtime";

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

  resolveStyle() {
    return {};
  },

  component: ChartRealtime,
};
