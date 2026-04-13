import EnergyBarChart from "../standard/EnergyBarChart";
import { buildEnergyBarChartDemo } from "@/modules/organizarScada/utils/chartDemos";

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

  resolveStyle(palette) {
    return {
      barGradientFrom: palette.primary   || "#3b82f6",
      limitColor:      palette.secondary || "#94a3b8",
      labelColor:      palette.text      || "#ffffff",
    };
  },

  component: EnergyBarChart,
};
