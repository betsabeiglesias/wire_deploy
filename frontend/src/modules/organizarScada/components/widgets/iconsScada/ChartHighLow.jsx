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
  dataLabels: { enabled: true },
  stroke: { curve: "smooth" },
  title: { text: "Average High & Low Temperature", align: "left" },
  grid: {
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

const ChartHighLow = ({
  series,
  options,
  height,
  width,
  type = "line",

  // 🎯 THEME
  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) => {

  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...(options || {}) };

    opts.chart = {
      ...defaultOptions.chart,
      ...(options?.chart || {}),
      background: backgroundColor,
      type,
    };

    // 🎨 COLORES SERIES
    opts.colors = options?.colors || [primaryColor, secondaryColor];

    const hNum = Number(height);
    const wNum = Number(width);
    if (Number.isFinite(hNum)) opts.chart.height = hNum;
    else if (height) opts.chart.height = height;
    if (Number.isFinite(wNum)) opts.chart.width = wNum;
    else if (width) opts.chart.width = width;

    opts.dataLabels = { ...defaultOptions.dataLabels, ...(options?.dataLabels || {}) };
    opts.stroke = { ...defaultOptions.stroke, ...(options?.stroke || {}) };

    // 🎯 TITLE
    opts.title = {
      ...defaultOptions.title,
      ...(options?.title || {}),
      style: {
        color: textColor,
        ...(options?.title?.style || {}),
      },
    };

    // 🎯 GRID
    opts.grid = {
      ...defaultOptions.grid,
      ...(options?.grid || {}),
      borderColor: gridColor,
    };

    // 🎯 X AXIS
    opts.xaxis = {
      ...defaultOptions.xaxis,
      ...(options?.xaxis || {}),
      labels: {
        ...(options?.xaxis?.labels || {}),
        style: { colors: axisColor },
      },
      axisBorder: { color: axisColor },
      axisTicks: { color: axisColor },
    };

    // 🎯 Y AXIS
    opts.yaxis = {
      ...defaultOptions.yaxis,
      ...(options?.yaxis || {}),
      labels: {
        ...(options?.yaxis?.labels || {}),
        style: { colors: axisColor },
      },
    };

    // 🎯 LEGEND
    opts.legend = {
      ...defaultOptions.legend,
      ...(options?.legend || {}),
      labels: {
        colors: textColor,
      },
    };

    return opts;
  }, [
    options,
    height,
    width,
    backgroundColor,
    textColor,
    gridColor,
    axisColor,
    primaryColor,
    secondaryColor,
    type,
  ]);

  const resolvedSeries =
    Array.isArray(series) && series.length ? series : defaultSeries;

  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || "100%";

  const chartWidth = Number.isFinite(Number(width))
    ? Number(width)
    : width || "100%";

  return (
    <div
      className="w-full h-full"
      style={{
        background: backgroundColor,
        color: textColor,
      }}
    >
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