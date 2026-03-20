import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const defaultSeries = [
  {
    name: "Desktops",
    data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
  },
];

const defaultOptions = {
  chart: {
    type: "line",
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "straight" },
  title: { text: "Product Trends by Month", align: "left" },
  grid: {
    row: { colors: ["#f3f3f3", "transparent"], opacity: 0.5 },
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  },
};

/**
 * ChartBasic (ApexCharts)
 * - Respeta width/height recibidos (num o string) y se adapta al canvas al redimensionar.
 * - Permite inyectar options/series; hace merge superficial con defaults.
 */
const ChartBasic = ({ series, options, height, width, type = "line" }) => {
  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...(options || {}) };
    opts.chart = { ...defaultOptions.chart, ...(options?.chart || {}) };
    // Ajuste dinámico de tamaño: Apex prefiere valores numéricos.
    const hNum = Number(height);
    const wNum = Number(width);
    if (Number.isFinite(hNum)) opts.chart.height = hNum;
    else if (height) opts.chart.height = height; // fallback string (%, px)
    if (Number.isFinite(wNum)) opts.chart.width = wNum;
    else if (width) opts.chart.width = width;
    opts.dataLabels = {
      ...defaultOptions.dataLabels,
      ...(options?.dataLabels || {}),
    };
    opts.stroke = { ...defaultOptions.stroke, ...(options?.stroke || {}) };
    opts.title = { ...defaultOptions.title, ...(options?.title || {}) };
    opts.grid = { ...defaultOptions.grid, ...(options?.grid || {}) };
    opts.xaxis = { ...defaultOptions.xaxis, ...(options?.xaxis || {}) };
    return opts;
  }, [options, height, width]);

  const resolvedSeries = Array.isArray(series) && series.length
    ? series
    : defaultSeries;

  // Apex acepta número o string; si no hay altura/ancho, usamos 100%.
  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || "100%";
  const chartWidth = Number.isFinite(Number(width))
    ? Number(width)
    : width || "100%";

  return (
    <div className="w-full h-full">
      <ReactApexChart
        key={`${chartWidth}-${chartHeight}`} // fuerza re-render al cambiar tamaño
        options={mergedOptions}
        series={resolvedSeries}
        type={type}
        height={chartHeight}
        width={chartWidth}
      />
    </div>
  );
};

export default ChartBasic;
