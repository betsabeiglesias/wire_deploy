import ChartSocialGroup from "../iconsScada/ChartSocialGroup";

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

  resolveStyle() {
    return {};
  },

  component: ChartSocialGroup,
};
