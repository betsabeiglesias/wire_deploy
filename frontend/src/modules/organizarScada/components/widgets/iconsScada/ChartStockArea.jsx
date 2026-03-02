import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const defaultSeries = [
  {
    name: "XYZ MOTORS",
    data: [
      [new Date("2012-01-01").getTime(), 31000000],
      [new Date("2012-02-01").getTime(), 34000000],
      [new Date("2012-03-01").getTime(), 29000000],
      [new Date("2012-04-01").getTime(), 36000000],
      [new Date("2012-05-01").getTime(), 42000000],
      [new Date("2012-06-01").getTime(), 39000000],
      [new Date("2012-07-01").getTime(), 45000000],
    ],
  },
];

const defaultOptions = {
  chart: {
    type: "area",
    stacked: false,
    zoom: { type: "x", enabled: true, autoScaleYaxis: true },
    toolbar: { autoSelected: "zoom" },
  },
  dataLabels: { enabled: false },
  markers: { size: 0 },
  title: { text: "Stock Price Movement", align: "left" },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  },
  yaxis: {
    labels: {
      formatter: (val) => (val / 1_000_000).toFixed(0),
    },
    title: { text: "Price" },
  },
  xaxis: { type: "datetime" },
  tooltip: {
    shared: false,
    y: {
      formatter: (val) => (val / 1_000_000).toFixed(0),
    },
  },
};

const ChartStockArea = ({ series, options, height, width, type = "area" }) => {
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
    opts.markers = { ...defaultOptions.markers, ...(options?.markers || {}) };
    opts.title = { ...defaultOptions.title, ...(options?.title || {}) };
    opts.fill = { ...defaultOptions.fill, ...(options?.fill || {}) };
    opts.yaxis = { ...defaultOptions.yaxis, ...(options?.yaxis || {}) };
    opts.xaxis = { ...defaultOptions.xaxis, ...(options?.xaxis || {}) };
    opts.tooltip = { ...defaultOptions.tooltip, ...(options?.tooltip || {}) };
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

export default ChartStockArea;
