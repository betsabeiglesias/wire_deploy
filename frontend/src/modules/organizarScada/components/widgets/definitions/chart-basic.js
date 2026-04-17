import ChartBasic from "../iconsScada/ChartBasic";
import { buildBaseStyle } from "./_shared";

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

  component: ChartBasic,
};
