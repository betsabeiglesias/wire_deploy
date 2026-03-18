import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const defaultSeries = [
  {
    name: "High - 2013",
    data: [28, 29, 33, 36, 32, 32, 33],
  },
  {
    name: "Low - 2013",
    data: [12, 11, 14, 18, 17, 13, 13],
  },
];

const defaultOptions = {
  chart: {
    type: "line",
    dropShadow: {
      enabled: true,
      color: "#000",
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.5,
    },
    zoom: { enabled: false },
    toolbar: { show: false },
  },
  colors: ["#77B6EA", "#545454"],
  dataLabels: { enabled: true },
  stroke: { curve: "smooth" },
  title: { text: "Average High & Low Temperature", align: "left" },
  grid: {
    borderColor: "#e7e7e7",
    row: { colors: ["#f3f3f3", "transparent"], opacity: 0.5 },
  },
  markers: { size: 1 },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    title: { text: "Month" },
  },
  yaxis: {
    title: { text: "Temperature" },
    min: 5,
    max: 40,
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -25,
    offsetX: -5,
  },
};

const ChartHighLow = ({ series, options, height, width, type = "line" }) => {
  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...(options || {}) };
    opts.chart = { ...defaultOptions.chart, ...(options?.chart || {}) };
    const hNum = Number(height);
    const wNum = Number(width);
    if (Number.isFinite(hNum)) opts.chart.height = hNum;
    else if (height) opts.chart.height = height;
    if (Number.isFinite(wNum)) opts.chart.width = wNum;
    else if (width) opts.chart.width = width;
    opts.colors = options?.colors || defaultOptions.colors;
    opts.dataLabels = { ...defaultOptions.dataLabels, ...(options?.dataLabels || {}) };
    opts.stroke = { ...defaultOptions.stroke, ...(options?.stroke || {}) };
    opts.title = { ...defaultOptions.title, ...(options?.title || {}) };
    opts.grid = { ...defaultOptions.grid, ...(options?.grid || {}) };
    opts.markers = { ...defaultOptions.markers, ...(options?.markers || {}) };
    opts.xaxis = { ...defaultOptions.xaxis, ...(options?.xaxis || {}) };
    opts.yaxis = { ...defaultOptions.yaxis, ...(options?.yaxis || {}) };
    opts.legend = { ...defaultOptions.legend, ...(options?.legend || {}) };
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

export default ChartHighLow;
