import gaugeDefaultIcon from "@/assets/icons/gaugeDefault.svg";

export const elementos_scada = {
  gauges: [
    {
      id: "tpl-temp-gauge",
      title: "Temp Gauge",
      thumbnailUrl: gaugeDefaultIcon, // Reusamos icono por ahora
      data: {
        type: "temp-gauge",
        width: 220,
        height: 220,
        label: "Temperatura",
        settings: { min: 0, max: 120, unit: "°C" },
      },
    },
  ],
  barras: [
    {
      id: "tpl-hmi-progress-bar",
      title: "Barra HMI",
      thumbnailUrl: gaugeDefaultIcon,
      data: {
        type: "hmi-progress-bar",
        width: 450,
        height: 90,
        label: "LOREM IPSUM",
        settings: {
          minValue: 0,
          maxValue: 100,
          initialValue: 66,
          caption: "LOREM IPSUM",
        },
      },
    },
  ],
  tarjetas: [],
  graficas: [
    {
      id: "tpl-energy-bar-chart",
      title: "Energy Bar Chart",
      thumbnailUrl: gaugeDefaultIcon,
      data: {
        type: "energy-bar-chart",
        width: 400,
        height: 250,
        label: "CONSUMO ENERGÉTICO (kW)",
        settings: {
          title: "CONSUMO ENERGÉTICO (kW)",
          valueText: "420 kW",
        },
      },
    },
    {
      id: "tpl-temperature-line-chart",
      title: "Temperature Line Chart",
      thumbnailUrl: gaugeDefaultIcon,
      data: {
        type: "temperature-line-chart",
        width: 400,
        height: 250,
        label: "Temp °C",
        settings: {
          legendLabel: "Temp °C",
          pointLabel: "55ºC",
        },
      },
    },
  ],
};
