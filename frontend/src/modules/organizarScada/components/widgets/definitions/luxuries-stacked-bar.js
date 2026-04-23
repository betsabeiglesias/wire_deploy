import LuxuriesStackedBarChart from "../standard/LuxuriesStackedBarChart";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "luxuries-stacked-bar",
  label:       "Grafica Barras Apiladas",
  category:    "graficas",
  icon:        "chartBar",
  defaultSize: { w: 600, h: 340 },

  buildProps({ width, height }) {
    return {
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
      tertiaryColor: base.warning,
      quaternaryColor: base.success,
    };
  },

  component: LuxuriesStackedBarChart,
};
