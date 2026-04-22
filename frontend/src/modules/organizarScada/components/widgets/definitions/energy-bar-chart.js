import EnergyBarChart from "../standard/EnergyBarChart";
import { buildEnergyBarChartDemo } from "@/modules/organizarScada/utils/chartDemos";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "energy-bar-chart",
  label:       "Gráfico de Barras Energía",
  category:    "graficas",
  icon:        "chartBar",
  defaultSize: { w: 300, h: 180 },

  buildProps({ settings, live, width, height, demoNow }) {
    const demo  = buildEnergyBarChartDemo({ now: demoNow, settings });
    const label = settings.attributeLabel || settings.label || "";
    return {
      title:  settings.title || label,
      bars:   settings.series || demo.bars,
      width,
      height,
    };
  },

  styleSchema: [
    {
      group: "Gráfico",
      fields: [
        { key: "primary",   label: "Color barras",  type: "color" },
        { key: "secondary", label: "Color límite",  type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color texto", type: "color" },
      ],
    },
  ],

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      bgColor: base.bgColor,
      gridColor: base.gridColor,
      axisColor: base.axisColor,

      titleColor: base.titleColor,
      labelColor: base.labelColor,

      barGradientFrom: base.primary,
      barGradientTo: base.primaryDark,

      limitColor: base.danger,
      alertBarColor: base.warning,
    };
  },

  component: EnergyBarChart,
};
