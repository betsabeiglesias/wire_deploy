import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const defaultSeries = [
  {
    name: "Session Duration",
    data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
  },
  {
    name: "Page Views",
    data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
  },
  {
    name: "Total Visits",
    data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
  },
];

const defaultOptions = {
  chart: {
    type: "line",
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { width: [5, 7, 5], curve: "straight", dashArray: [0, 8, 5] },
  title: { text: "Page Statistics", align: "left" },
  legend: {
    tooltipHoverFormatter: (val, opts) =>
      `${val} - <strong>${opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex]}</strong>`,
  },
  markers: { size: 0, hover: { sizeOffset: 6 } },
  xaxis: {
    categories: [
      "01 Jan",
      "02 Jan",
      "03 Jan",
      "04 Jan",
      "05 Jan",
      "06 Jan",
      "07 Jan",
      "08 Jan",
      "09 Jan",
      "10 Jan",
      "11 Jan",
      "12 Jan",
    ],
  },
  tooltip: {
    y: [
      {
        title: { formatter: (val) => `${val} (mins)` },
      },
      {
        title: { formatter: (val) => `${val} per session` },
      },
      {
        title: { formatter: (val) => val },
      },
    ],
  },
  grid: { borderColor: "#f1f1f1" },
};

const ChartPageStats = ({ series, options, height, width, type = "line" }) => {
  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...(options || {}) };
    opts.chart = { ...defaultOptions.chart, ...(options?.chart || {}) };
    const hNum = Number(height);
    const wNum = Number(width);
    if (Number.isFinite(hNum)) opts.chart.height = hNum;
    else if (height) opts.chart.height = height;
    if (Number.isFinite(wNum)) opts.chart.width = wNum;
    else if (width) opts.chart.width = width;
    opts.dataLabels = { ...defaultOptions.dataLabels, ...(options?.dataLabels || {}) };
    opts.stroke = { ...defaultOptions.stroke, ...(options?.stroke || {}) };
    opts.title = { ...defaultOptions.title, ...(options?.title || {}) };
    opts.legend = { ...defaultOptions.legend, ...(options?.legend || {}) };
    opts.markers = { ...defaultOptions.markers, ...(options?.markers || {}) };
    opts.xaxis = { ...defaultOptions.xaxis, ...(options?.xaxis || {}) };
    opts.tooltip = { ...defaultOptions.tooltip, ...(options?.tooltip || {}) };
    opts.grid = { ...defaultOptions.grid, ...(options?.grid || {}) };
    return opts;
  }, [options, height, width]);

  const resolvedSeries =
    Array.isArray(series) && series.length ? series : defaultSeries;

  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || "100%";
  const chartWidth = Number.isFinite(Number(width))
    ? Number(width)
    : width || "100%";

  return (
    <div className="w-full h-full">
      <ReactApexChart
        key={`${chartWidth}-${chartHeight}`}
        options={mergedOptions}
        series={resolvedSeries}
        type={type}
        height={chartHeight}
        width={chartWidth}
      />
    </div>
  );
};

export default ChartPageStats;
