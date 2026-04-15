// widgets/index.js
// Registro central de widgets. Para añadir un widget nuevo:
//   1. Crear su archivo en definitions/
//   2. Importarlo aquí y añadirlo al array

import tempGauge            from "./definitions/temp-gauge";
import hmiScadaGauge        from "./definitions/hmi-scada-gauge";
import hmiHorizontalGauge   from "./definitions/hmi-horizontal-gauge";
import hmiProgressBar       from "./definitions/hmi-progress-bar";
import hmiTankLevel         from "./definitions/hmi-tank-level";
import hmiStatusCard        from "./definitions/hmi-status-card";
import hmiEnergySummary     from "./definitions/hmi-energy-summary";
import hmiTrendCard         from "./definitions/hmi-trend-card";
import chartBasic           from "./definitions/chart-basic";
import chartHighLow         from "./definitions/chart-high-low";
import chartStockArea       from "./definitions/chart-stock-area";
import chartSocialGroup     from "./definitions/chart-social-group";
import chartRealtime        from "./definitions/chart-realtime";
import chartPageStats       from "./definitions/chart-page-stats";
import energyBarChart       from "./definitions/energy-bar-chart";
import temperatureLineChart from "./definitions/temperature-line-chart";
import luxuriesStackedBar   from "./definitions/luxuries-stacked-bar";
import miniChart            from "./definitions/mini-chart";
import miniRing             from "./definitions/mini-ring";
import miniHorizontal       from "./definitions/mini-horizontal";
import miniDonut            from "./definitions/mini-donut";
import miniBubble           from "./definitions/mini-bubble";
import miniNeedle           from "./definitions/mini-needle";
import miniLamp             from "./definitions/mini-lamp";
import miniTable            from "./definitions/mini-table";
import imageWidget          from "./definitions/image-widget";
import processValueCard     from "./definitions/process-value-card";
import processStatusBadge   from "./definitions/process-status-badge";
import processLevelCard     from "./definitions/process-level-card";

const ALL_DEFINITIONS = [
  tempGauge,
  hmiScadaGauge,
  hmiHorizontalGauge,
  hmiProgressBar,
  hmiTankLevel,
  hmiStatusCard,
  hmiEnergySummary,
  hmiTrendCard,
  chartBasic,
  chartHighLow,
  chartStockArea,
  chartSocialGroup,
  chartRealtime,
  chartPageStats,
  energyBarChart,
  temperatureLineChart,
  luxuriesStackedBar,
  miniChart,
  miniRing,
  miniHorizontal,
  miniDonut,
  miniBubble,
  miniNeedle,
  miniLamp,
  miniTable,
  imageWidget,
  processValueCard,
  processStatusBadge,
  processLevelCard,
];

export const WIDGET_REGISTRY = Object.fromEntries(
  ALL_DEFINITIONS.map((d) => [d.type, d])
);

export const DEFAULT_STYLE_SCHEMA = [
  {
    group: "General",
    fields: [
      { key: "primary", label: "Color principal", type: "color" },
      { key: "text",    label: "Color texto",     type: "color" },
    ],
  },
];
