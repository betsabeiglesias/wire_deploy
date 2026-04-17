import ChartStockArea from "../iconsScada/ChartStockArea";
import { buildBaseStyle } from "./_shared";

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

  component: ChartStockArea,
};
