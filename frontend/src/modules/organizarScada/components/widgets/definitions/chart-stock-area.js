import ChartStockArea from "../iconsScada/ChartStockArea";

export default {
  type:        "chart-stock-area",
  label:       "Grafica Stock Area",
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

  component: ChartStockArea,
};
