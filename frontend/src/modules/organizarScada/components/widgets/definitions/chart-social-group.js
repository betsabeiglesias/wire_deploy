import ChartSocialGroup from "../iconsScada/ChartSocialGroup";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "chart-social-group",
  label:       "Grupo de Graficas Sociales",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 360, h: 360 },

  buildProps({ settings, width, height }) {
    return {
      settings,
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

  component: ChartSocialGroup,
};
