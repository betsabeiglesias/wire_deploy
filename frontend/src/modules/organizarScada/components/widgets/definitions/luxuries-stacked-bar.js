import LuxuriesStackedBarChart from "../standard/LuxuriesStackedBarChart";

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

  resolveStyle() {
    return {};
  },

  component: LuxuriesStackedBarChart,
};
