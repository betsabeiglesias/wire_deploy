import TemperatureLineChart from "../standard/TemperatureLineChart";
import { buildTemperatureLineChartDemo } from "@/modules/organizarScada/utils/chartDemos";

export default {
  type:        "temperature-line-chart",
  label:       "Gráfico de Línea Temperatura",
  category:    "graficas",
  icon:        "chart",
  defaultSize: { w: 300, h: 180 },

  buildProps({ settings, live, demoNow }) {
    const demo  = buildTemperatureLineChartDemo({ now: demoNow, settings });
    const label = settings.attributeLabel || settings.label || "";
    return {
      label:  settings.legendLabel || label,
      series: settings.series      || demo.series,
    };
  },

  styleSchema: [
    {
      group: "Línea",
      fields: [
        { key: "primary",   label: "Color línea", type: "color" },
        { key: "secondary", label: "Color área",  type: "color" },
      ],
    },
  ],

  resolveStyle(palette) {
    return {
      lineColor: palette.primary   || "#3b82f6",
      areaColor: palette.secondary || "#93c5fd",
    };
  },

  component: TemperatureLineChart,
};
