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
  legend: {},
  markers: { size: 0, hover: { sizeOffset: 6 } },
  xaxis: {
    categories: [
      "01 Jan", "02 Jan", "03 Jan", "04 Jan",
      "05 Jan", "06 Jan", "07 Jan", "08 Jan",
      "09 Jan", "10 Jan", "11 Jan", "12 Jan",
    ],
  },
  tooltip: {},
  grid: {},
};

const ChartPageStats = ({
  series,
  options,
  height,
  width,
  type = "line",

  // 🎨 Props desde el theme
  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) => {
  const mergedOptions = useMemo(() => {
    const opts = {
      ...defaultOptions,
      ...(options || {}),
    };

    // 🎯 THEME aplicado
    opts.chart = {
      ...defaultOptions.chart,
      ...(options?.chart || {}),
      type,
      background: backgroundColor,
    };

    // ✅ Colores por serie
    opts.colors = [
      primaryColor,
      secondaryColor || primaryColor,
      "#94a3b8",
    ];

    opts.title = {
      ...defaultOptions.title,
      ...(options?.title || {}),
      style: {
        color: textColor,
      },
    };

    opts.grid = {
      ...defaultOptions.grid,
      ...(options?.grid || {}),
      borderColor: gridColor,
    };

    opts.xaxis = {
      ...defaultOptions.xaxis,
      ...(options?.xaxis || {}),
      labels: {
        style: { colors: axisColor },
      },
      axisBorder: { color: axisColor },
      axisTicks: { color: axisColor },
    };

    opts.yaxis = {
      ...(options?.yaxis || {}),
      labels: {
        style: { colors: axisColor },
      },
    };

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

export default ChartPageStats;