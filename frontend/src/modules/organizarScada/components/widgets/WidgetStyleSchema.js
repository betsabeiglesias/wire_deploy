// src/modules/organizarScada/components/widgets/WidgetStyleSchema.js

export const widgetStyleSchema = {
  "hmi-scada-gauge": [
    {
      group: "General",
      fields: [
        { key: "primary", label: "Color principal (aguja)", type: "color" },
        { key: "secondary", label: "Color ticks", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color valor", type: "color" },
        { key: "unit", label: "Color unidad", type: "color" },
      ],
    },
  ],

  "temp-gauge": [
    {
      group: "Gauge",
      fields: [
        { key: "primary", label: "Color arco", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color valor", type: "color" },
        { key: "label", label: "Color etiqueta", type: "color" },
      ],
    },
  ],

  "hmi-progress-bar": [
    {
      group: "Barra",
      fields: [
        { key: "primary", label: "Color barra", type: "color" },
        { key: "secondary", label: "Color degradado", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color texto", type: "color" },
      ],
    },
  ],

  "hmi-tank-level": [
    {
      group: "Nivel",
      fields: [
        { key: "primary", label: "Color líquido", type: "color" },
        { key: "secondary", label: "Color gradiente", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color valor", type: "color" },
      ],
    },
  ],

  "energy-bar-chart": [
    {
      group: "Gráfico",
      fields: [
        { key: "primary", label: "Color barras", type: "color" },
        { key: "secondary", label: "Color límite", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color texto", type: "color" },
      ],
    },
  ],

  "temperature-line-chart": [
    {
      group: "Línea",
      fields: [
        { key: "primary", label: "Color línea", type: "color" },
        { key: "secondary", label: "Color área", type: "color" },
      ],
    },
  ],

  /* 🔥 DEFAULT GLOBAL */
  default: [
    {
      group: "General",
      fields: [
        { key: "primary", label: "Color principal", type: "color" },
        { key: "text", label: "Color texto", type: "color" },
      ],
    },
  ],
};