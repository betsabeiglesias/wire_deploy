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

const ChartBasic = ({
  series,
  options,
  height,
  width,
  type = "line",

  // 🎯 NUEVO: PROPS DE THEME
  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) => {

  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...(options || {}) };

    // ⚙️ chart base
    opts.chart = {
      ...defaultOptions.chart,
      ...(options?.chart || {}),
      background: backgroundColor,
      type,
    };

    // 🎨 colores series
    opts.colors = [primaryColor, secondaryColor];

    // 📊 tamaño dinámico
    const hNum = Number(height);
    const wNum = Number(width);
    if (Number.isFinite(hNum)) opts.chart.height = hNum;
    else if (height) opts.chart.height = height;

    if (Number.isFinite(wNum)) opts.chart.width = wNum;
    else if (width) opts.chart.width = width;

    // 🧩 resto merges (igual que tenías)
    opts.dataLabels = {
      ...defaultOptions.dataLabels,
      ...(options?.dataLabels || {}),
    };

    opts.stroke = {
      ...defaultOptions.stroke,
      ...(options?.stroke || {}),
    };

    // 🎯 TITLE con theme
    opts.title = {
      ...defaultOptions.title,
      ...(options?.title || {}),
      style: {
        color: textColor,
        ...(options?.title?.style || {}),
      },
    };

    // 🎯 GRID con theme
    opts.grid = {
      ...defaultOptions.grid,
      ...(options?.grid || {}),
      borderColor: gridColor,
    };

    // 🎯 X AXIS con theme
    opts.xaxis = {
      ...defaultOptions.xaxis,
      ...(options?.xaxis || {}),
      labels: {
        ...(options?.xaxis?.labels || {}),
        style: {
          colors: axisColor,
        },
      },
      axisBorder: {
        color: axisColor,
      },
      axisTicks: {
        color: axisColor,
      },
    };

    // 🎯 Y AXIS con theme
    opts.yaxis = {
      ...(options?.yaxis || {}),
      labels: {
        ...(options?.yaxis?.labels || {}),
        style: {
          colors: axisColor,
        },
      },
    };

    // 🎯 LEGEND con theme
    opts.legend = {
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
    Array.isArray(series) && series.length
      ? series
      : defaultSeries;

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

export default ChartBasic;