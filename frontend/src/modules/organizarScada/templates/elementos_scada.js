// // import gaugeDefaultIcon from "@/assets/icons/gaugeDefault.svg";

// export const elementos_scada = {
//   gauges: [
//         {
//       id: "tpl-temp-gauge",
//       title: "Temp Gauge",
//           icon: "gauge",
//       thumbnailType: "preview", // Reusamos icono por ahora
//       data: {
//         type: "temp-gauge",
//         width: 160,
//         height: 160,
//         label: "Temperatura",
//         settings: {
//           min: 0,
//           max: 140,
//           unit: "C",
//           label: "Temperatura",
//           labelColor: "rgba(248,113,113,0.95)",
//           valueColor: "rgba(248,113,113,0.98)",
//           labelOffsetX: 0,
//           labelOffsetY: 0,
//           valueOffsetX: 0,
//           valueOffsetY: 0,
//           needleColor: "rgba(255,255,255,0.95)",
//           tickColor: "rgba(251,146,60,0.95)",
//           arcStartColor: "rgba(251,146,60,1)",
//           arcMidColor: "rgba(249,115,22,1)",
//           arcEndColor: "rgba(239,68,68,1)",
//           showMinMax: true,
//           showLabel: true,
//           showValue: true,
//           minMaxColor: "rgba(148,163,184,0.9)",
//           minMaxFontSize: 11,
//         },
//       },
//     },
//       // },
//     // },
//     {
//       id: "tpl-hmi-scada-gauge-thermal",
//       title: "SCADA Gauge Thermal",
//            icon: "gauge",
//       thumbnailType: "preview",

//       data: {
//         type: "hmi-scada-gauge",
//         width: 220,
//         height: 220,
//         label: "Reactor_Temp_01",
//         settings: {
//           unit: "CELSIUS",
//           min: 0,
//           max: 200,
//           themeColor: "#f43f5e",
//           initialValue: 140,
//           zones: [
//             { start: 160, end: 200, color: "#f43f5e" },
//             { start: 130, end: 160, color: "#f59e0b" },
//           ],
//         },
//       },
//     },
//     // {
//     //   id: "tpl-hmi-scada-gauge-pressure",
//     //   title: "SCADA Gauge Pressure",
//     //   thumbnailType: gaugeDefaultIcon,
//     //   data: {
//     //     type: "hmi-scada-gauge",
//     //     width: 220,
//     //     height: 220,
//     //     label: "Hydraulic_Press_04",
//     //     settings: {
//     //       unit: "BAR / PSI",
//     //       min: 0,
//     //       max: 10,
//     //       themeColor: "#06b6d4",
//     //       initialValue: 4.5,
//     //       zones: [{ start: 4, end: 7, color: "#10b981" }],
//     //     },
//     //   },
//     // },
//     // {
//     //   id: "tpl-hmi-scada-gauge-flow",
//     //   title: "SCADA Gauge Flow",
//     //   thumbnailType: gaugeDefaultIcon,
//     //   data: {
//     //     type: "hmi-scada-gauge",
//     //     width: 220,
//     //     height: 220,
//     //     label: "Load_Flow_Main",
//     //     settings: {
//     //       unit: "M3/HR",
//     //       min: 0,
//     //       max: 1000,
//     //       themeColor: "#f59e0b",
//     //       initialValue: 700,
//     //       zones: [{ start: 850, end: 1000, color: "#f43f5e" }],
//     //     },
//     //   },
//     // },
//     {
//       id: "tpl-hmi-horizontal-gauge-precision",
//       title: "Horizontal Gauge Precision",
//            icon: "gauge",
//       thumbnailType: "preview",

//       data: {
//         type: "hmi-horizontal-gauge",
//         width: 240,
//         height: 140,
//         label: "PT-102",
//         settings: {
//           min: 0,
//           max: 10,
//           initialValue: 4.2,
//           unit: "BAR",
//           variant: "precision",
//           accentColor: "#1e293b",
//         },
//       },
//     },
//     // {
//     //   id: "tpl-hmi-horizontal-gauge-heavy",
//     //   title: "Horizontal Gauge Heavy",
//     //   thumbnailUrl: gaugeDefaultIcon,
//     //   data: {
//     //     type: "hmi-horizontal-gauge",
//     //     width: 240,
//     //     height: 140,
//     //     label: "ST-405",
//     //     settings: {
//     //       min: 0,
//     //       max: 60,
//     //       initialValue: 32,
//     //       unit: "RPM x100",
//     //       variant: "heavy",
//     //       accentColor: "#1e40af",
//     //     },
//     //   },
//     // },
//     // {
//     //   id: "tpl-hmi-horizontal-gauge-arc",
//     //   title: "Horizontal Gauge Arc",
//     //   thumbnailUrl: gaugeDefaultIcon,
//     //   data: {
//     //     type: "hmi-horizontal-gauge",
//     //     width: 240,
//     //     height: 140,
//     //     label: "TT-099",
//     //     settings: {
//     //       min: 0,
//     //       max: 100,
//     //       initialValue: 55,
//     //       unit: "°C",
//     //       variant: "arc",
//     //       accentColor: "#be123c",
//     //     },
//     //   },
//     // },
//   ],
//   barras: [
//     {
//       id: "tpl-hmi-progress-bar",
//       title: "Barra HMI",
//            icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "hmi-progress-bar",
//         width: 230,
//         height: 60,
//         settings: {
//           minValue: 0,
//           maxValue: 100,
//           initialValue: 66,
//         },
//       },
//     },
//     {
//       id: "tpl-hmi-tank-level",
//       title: "Tanque Cilíndrico",
//            icon: "tank",
//       thumbnailType: "preview",

//       data: {
//         type: "hmi-tank-level",
//         width: 150,
//         height: 200,
//         label: "Nivel",
//         settings: {
//           minValue: 0,
//           maxValue: 100,
//           initialValue: 50,
//         },
//       },
//     },
//     // {
//     //   id: "tpl-mini-horizontal",
//     //   title: "Mini Horizontal",
//     //   thumbnailUrl: gaugeDefaultIcon,
//     //   data: {
//     //     type: "mini-horizontal",
//     //     width: 160,
//     //     height: 90,
//     //     label: "Carga",
//     //     settings: { minValue: 0, maxValue: 100, initialValue: 55 },
//     //   },
//     // },
//   ],
//   tarjetas: [
//     {
//       id: "tpl-hmi-status-ok",
//       title: "Status OK",
//            icon: "status",
//       thumbnailType: "preview",

//       data: {
//         type: "hmi-status-card",
//         width: 280,
//         height: 90,
//         label: "SISTEMA OK",
//         settings: {
//           status: "ok",
//           title: "SISTEMA OK",
//           subtitle: "STATUS: READY",
//         },
//       },
//     },
//     // {
//     //   id: "tpl-power-card",
//     //   title: "Power Card",
//     //   thumbnailUrl: gaugeDefaultIcon,
//     //   data: {
//     //     type: "power-card",
//     //     width: 180,
//     //     height: 120,
//     //     label: "Potencia",
//     //     settings: { initialValue: 415, unit: "kW" },
//     //   },
//     // },
//     // { SE BORRA TEMPORALMENTE PARA REEMPLAZAR POR OTRA TARJETA
//     //   id: "tpl-hmi-trend-card",
//     //   title: "Tarjeta Dashboard",
//     //   thumbnailUrl: gaugeDefaultIcon,
//     //   data: {
//     //     type: "hmi-trend-card",
//     //     width: 400,
//     //     height: 220,
//     //     label: "Caudal de Proceso - Cuba 2",
//     //     settings: {
//     //       title: "Caudal de Proceso - Cuba 2",
//     //       unitLabel: "LOREM IPSUM",
//     //       minValue: 0,
//     //       maxValue: 10000,
//     //       initialValue: 5684,
//     //       series: [110, 115, 108, 120, 130, 125, 140, 135, 150, 145],
//     //     },
//     //   },
//     // },
//     {
//       id: "tpl-hmi-energy-summary",
//       title: "Tarjeta Energy Summary",
//            icon: "card",
//       thumbnailType: "preview",
//       data: {
//         type: "hmi-energy-summary",
//         width: 380,
//         height: 140,
//         label: "Consumo Electrico 2026",
//         settings: {
//           title: "Consumo electrico 2026",
//           value: "1.627.009,26",
//           unit: "kWh",
//           subtitle: "Energia electrica",
//           deltaText: "Consumo 2026",
//           deltaValue: "2%",
//           deltaDirection: "up",
//         },
//       },
//     },
//   ],
//   graficas: [
//     {
//       id: "tpl-chart-high-low",
//       title: "Chart High/Low",
//            icon:"chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-high-low",
//         width: 320,
//         height: 240,
//         label: "High & Low Temp",
//         settings: {
//           series: [
//             { name: "High - 2013", data: [28, 29, 33, 36, 32, 32, 33] },
//             { name: "Low - 2013", data: [12, 11, 14, 18, 17, 13, 13] },
//           ],
//           options: {
//             title: { text: "Average High & Low Temperature", align: "left" },
//             xaxis: {
//               categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
//               title: { text: "Month" },
//             },
//             yaxis: { title: { text: "Temperature" }, min: 5, max: 40 },
//             markers: { size: 1 },
//             dataLabels: { enabled: true },
//             stroke: { curve: "smooth" },
//             legend: {
//               position: "top",
//               horizontalAlign: "right",
//               floating: true,
//               offsetY: -25,
//               offsetX: -5,
//             },
//           },
//         },
//       },
//     },
//     {
//       id: "tpl-chart-stock-area",
//       title: "Chart Stock Area",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-stock-area",
//         width: 360,
//         height: 240,
//         label: "Stock Price Movement",
//         settings: {
//           series: [
//             {
//               name: "XYZ MOTORS",
//               data: [
//                 [new Date("2012-01-01").getTime(), 31000000],
//                 [new Date("2012-02-01").getTime(), 34000000],
//                 [new Date("2012-03-01").getTime(), 29000000],
//                 [new Date("2012-04-01").getTime(), 36000000],
//                 [new Date("2012-05-01").getTime(), 42000000],
//                 [new Date("2012-06-01").getTime(), 39000000],
//                 [new Date("2012-07-01").getTime(), 45000000],
//               ],
//             },
//           ],
//           options: {
//             title: { text: "Stock Price Movement", align: "left" },
//             xaxis: { type: "datetime" },
//             yaxis: {
//               title: { text: "Price" },
//               labels: { formatter: (val) => (val / 1_000_000).toFixed(0) },
//             },
//             markers: { size: 0 },
//             dataLabels: { enabled: false },
//             fill: {
//               type: "gradient",
//               gradient: {
//                 shadeIntensity: 1,
//                 inverseColors: false,
//                 opacityFrom: 0.5,
//                 opacityTo: 0,
//                 stops: [0, 90, 100],
//               },
//             },
//             tooltip: {
//               shared: false,
//               y: { formatter: (val) => (val / 1_000_000).toFixed(0) },
//             },
//           },
//         },
//       },
//     },
//     {
//       id: "tpl-chart-social-group",
//       title: "Chart Social Group",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-social-group",
//         width: 360,
//         height: 360,
//         label: "Social Group Charts",
//         settings: {
//           // Usa series aleatorias por defecto; se pueden reemplazar.
//         },
//       },
//     },
//     {
//       id: "tpl-chart-realtime",
//       title: "Chart Realtime",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-realtime",
//         width: 340,
//         height: 200,
//         label: "Realtime Line",
//         settings: {
//           title: "Dynamic Updating Chart",
//           xaxisRange: 90000,
//           yMax: 100,
//         },
//       },
//     },
//     {
//       id: "tpl-chart-page-stats",
//       title: "Chart Page Stats",
//           icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-page-stats",
//         width: 360,
//         height: 240,
//         label: "Page Statistics",
//         settings: {
//           series: [
//             {
//               name: "Session Duration",
//               data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
//             },
//             {
//               name: "Page Views",
//               data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
//             },
//             {
//               name: "Total Visits",
//               data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
//             },
//           ],
//           options: {
//             title: { text: "Page Statistics", align: "left" },
//             xaxis: {
//               categories: [
//                 "01 Jan",
//                 "02 Jan",
//                 "03 Jan",
//                 "04 Jan",
//                 "05 Jan",
//                 "06 Jan",
//                 "07 Jan",
//                 "08 Jan",
//                 "09 Jan",
//                 "10 Jan",
//                 "11 Jan",
//                 "12 Jan",
//               ],
//             },
//             stroke: { width: [5, 7, 5], curve: "straight", dashArray: [0, 8, 5] },
//             legend: {
//               tooltipHoverFormatter: function (val, opts) {
//                 return (
//                   val +
//                   " - <strong>" +
//                   opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
//                   "</strong>"
//                 );
//               },
//             },
//             markers: { size: 0, hover: { sizeOffset: 6 } },
//             grid: { borderColor: "#f1f1f1" },
//           },
//         },
//       },
//     },

//     {
//       id: "tpl-chart-basic",
//       title: "Chart Basic",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "chart-basic",
//         width: 320,
//         height: 240,
//         label: "Chart Basic",
//         settings: {
//           height: 240,
//           type: "line",
//           series: [
//             {
//               name: "Desktops",
//               data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
//             },
//           ],
//           options: {
//             title: { text: "Product Trends by Month", align: "left" },
//             xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] },
//           },
//         },
//       },
//     },
//     {
//       id: "tpl-energy-bar-chart",
//       title: "Energy Bar Chart",
//          icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "energy-bar-chart",
//         width: 100,
//         height: 150,
//         label: "CONSUMO ENERGÉTICO (kW)",
//         settings: {
//           title: "CONSUMO ENERGÉTICO (kW)",
//           valueText: "420 kW",
//         },
//       },
//     },
//     {
//       id: "tpl-temperature-line-chart",
//       title: "Temperature Line Chart",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "temperature-line-chart",
//         width: 400,
//         height: 250,
//         label: "Temp °C",
//         settings: {
//           legendLabel: "Temp °C",
//           pointLabel: "55ºC",
//         },
//       },
//     },
//     {
//       id: "tpl-luxuries-stacked-bar",
//       title: "Luxuries Stacked Bar (full)",
//            icon: "chart",
//       thumbnailType: "preview",
//       data: {
//         type: "luxuries-stacked-bar",
//         width: 600,
//         height: 340,
//         label: "Luxuries spend",
//         settings: {},
//       },
//     },
    
//     {
//       id: "tpl-mini-chart",
//       title: "Mini Trend",
//            icon: "table",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-chart",
//         width: 220,
//         height: 140,
//         label: "Tendencia",
//         settings: { series: [20, 30, 45, 38, 52, 60, 54] },
//       },
//     },
//   ],
//   minis: [
//     {
//       id: "tpl-mini-ring",
//       title: "Ring Gauge",
//       icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-ring",
//         width: 120,
//         height: 120,
//         label: "Variable",
//         settings: { min: 0, max: 100, initialValue: 65, unit: "%" },
//       },
//     },
//     {
//       id: "tpl-mini-needle",
//       title: "Aguja",
//       icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-needle",
//         width: 120,
//         height: 120,
//         label: "Variable",
//         settings: { min: 0, max: 100, initialValue: 40, unit: "%" },
//       },
//     },
//     {
//       id: "tpl-mini-donut",
//       title: "Donut Gauge",
//       icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-donut",
//         width: 120,
//         height: 120,
//         label: "Variable",
//         settings: { min: 0, max: 100, initialValue: 75, unit: "%" },
//       },
//     },
//     {
//       id: "tpl-mini-horizontal",
//       title: "Barra Horizontal",
//       icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-horizontal",
//         width: 160,
//         height: 60,
//         label: "Carga",
//         settings: { min: 0, max: 100, initialValue: 55, unit: "%" },
//       },
//     },
//     {
//       id: "tpl-mini-bubble",
//       title: "Burbuja de Valor",
//       icon: "gauge",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-bubble",
//         width: 100,
//         height: 100,
//         label: "Valor",
//         settings: { initialValue: 42, unit: "kW" },
//       },
//     },
//     {
//       id: "tpl-mini-lamp",
//       title: "Lámpara Boolean",
//       icon: "status_ok",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-lamp",
//         width: 80,
//         height: 80,
//         label: "Estado",
//         settings: { initialValue: true },
//       },
//     },
//     {
//       id: "tpl-mini-table",
//       title: "Mini Table",
//            icon: "table",
//       thumbnailType: "preview",
//       data: {
//         type: "mini-table",
//         width: 220,
//         height: 160,
//         label: "Histórico",
//         settings: {
//           rows: [
//             { site: "PL1", equipment: "Línea A", variable: "Temp", value: "72.1", timestamp: "2026-02-05T10:00:00Z" },
//             { site: "PL1", equipment: "Línea A", variable: "Temp", value: "71.4", timestamp: "2026-02-05T09:55:00Z" },
//           ],
//         },
//       },
//     },

//   ],

//   proceso: [
//     // ── Tarjetas de valor (process-value-card) ──────────────────────────────
//     {
//       id: "tpl-pvc-temperature", title: "Temp · Valor", thumbnailType: "icon", icon: "temperature",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Temperatura",
//         settings: { iconKey: "temperature", label: "Temperatura", unit: "°C", min: 0, max: 200, initialValue: 75,
//           style: { palette: { primary: "#ef4444" } } } },
//     },
//     {
//       id: "tpl-pvc-pressure", title: "Presión · Valor", thumbnailType: "icon", icon: "pressure",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Presión",
//         settings: { iconKey: "pressure", label: "Presión", unit: "bar", min: 0, max: 16, initialValue: 6,
//           style: { palette: { primary: "#3b82f6" } } } },
//     },
//     {
//       id: "tpl-pvc-flow", title: "Caudal · Valor", thumbnailType: "icon", icon: "flow",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Caudal",
//         settings: { iconKey: "flow", label: "Caudal", unit: "m³/h", min: 0, max: 500, initialValue: 120,
//           style: { palette: { primary: "#06b6d4" } } } },
//     },
//     {
//       id: "tpl-pvc-pump", title: "Bomba · Valor", thumbnailType: "icon", icon: "pump",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Bomba",
//         settings: { iconKey: "pump", label: "Caudal bomba", unit: "m³/h", min: 0, max: 100, initialValue: 45,
//           style: { palette: { primary: "#29468b" } } } },
//     },
//     {
//       id: "tpl-pvc-compressor", title: "Compresor · Valor", thumbnailType: "icon", icon: "compressor",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Compresor",
//         settings: { iconKey: "compressor", label: "Presión salida", unit: "bar", min: 0, max: 12, initialValue: 8,
//           style: { palette: { primary: "#dc2626" } } } },
//     },
//     {
//       id: "tpl-pvc-filter", title: "Filtro · Valor", thumbnailType: "icon", icon: "filter",
//       data: { type: "process-value-card", width: 200, height: 120, label: "Filtro",
//         settings: { iconKey: "filter", label: "ΔP filtro", unit: "mbar", min: 0, max: 500, initialValue: 80,
//           style: { palette: { primary: "#92400e" } } } },
//     },
//     // ── Estado de equipo (process-status-badge) ─────────────────────────────
//     {
//       id: "tpl-psb-motor", title: "Motor · Estado", thumbnailType: "icon", icon: "motor",
//       data: { type: "process-status-badge", width: 160, height: 130, label: "Motor",
//         settings: { iconKey: "motor", label: "Motor", initialValue: "running",
//           style: { palette: { primary: "#7c3aed" } } } },
//     },
//     {
//       id: "tpl-psb-fan", title: "Ventilador · Estado", thumbnailType: "icon", icon: "fan",
//       data: { type: "process-status-badge", width: 160, height: 130, label: "Ventilador",
//         settings: { iconKey: "fan", label: "Ventilador", initialValue: "stopped",
//           style: { palette: { primary: "#0284c7" } } } },
//     },
//     {
//       id: "tpl-psb-pump", title: "Bomba · Estado", thumbnailType: "icon", icon: "pump",
//       data: { type: "process-status-badge", width: 160, height: 130, label: "Bomba",
//         settings: { iconKey: "pump", label: "Bomba centrif.", initialValue: "running",
//           style: { palette: { primary: "#29468b" } } } },
//     },
//     {
//       id: "tpl-psb-valve", title: "Válvula · Estado", thumbnailType: "icon", icon: "valve",
//       data: { type: "process-status-badge", width: 160, height: 130, label: "Válvula",
//         settings: { iconKey: "valve", label: "Válvula V-01", initialValue: "stopped",
//           style: { palette: { primary: "#f59e0b" } } } },
//     },
//     // ── Nivel de depósito (process-level-card) ──────────────────────────────
//     {
//       id: "tpl-plc-tank", title: "Depósito · Nivel", thumbnailType: "icon", icon: "tank",
//       data: { type: "process-level-card", width: 160, height: 200, label: "Depósito",
//         settings: { iconKey: "tank", label: "Depósito T-01", unit: "%", min: 0, max: 100, initialValue: 62,
//           style: { palette: { primary: "#3b82f6" } } } },
//     },
//     {
//       id: "tpl-plc-mixer", title: "Mezclador · Nivel", thumbnailType: "icon", icon: "mixer",
//       data: { type: "process-level-card", width: 160, height: 200, label: "Mezclador",
//         settings: { iconKey: "mixer", label: "Mezclador M-01", unit: "%", min: 0, max: 100, initialValue: 40,
//           style: { palette: { primary: "#059669" } } } },
//     },
//   ],
// };
