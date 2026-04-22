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

const ChartPageStats = ({
  series,
  options,
  height,
  width,
  type = "line",

  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) => {

  const mergedOptions = useMemo(() => {
    return {
      chart: {
        type,
        background: backgroundColor,
        toolbar: { show: false },
      },

      // 🔥 COLORES PRINCIPALES DEL THEME
      colors: [primaryColor, secondaryColor, "#94a3b8"],

      stroke: {
        width: [3, 3, 2],
        curve: "smooth",
      },

      dataLabels: {
        enabled: false,
      },

      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
      },

      title: {
        text: "Page Statistics",
        align: "left",
        style: {
          color: textColor,
          fontSize: "14px",
          fontWeight: 600,
        },
      },

      legend: {
        labels: {
          colors: textColor,
        },
      },

      xaxis: {
        categories: [
          "01 Jan","02 Jan","03 Jan","04 Jan","05 Jan","06 Jan",
          "07 Jan","08 Jan","09 Jan","10 Jan","11 Jan","12 Jan",
        ],
        labels: {
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
      },

      yaxis: {
        labels: {
          style: {
            colors: axisColor,
          },
        },
      },

      tooltip: {
        theme: backgroundColor === "#0f172a" ? "dark" : "light",
      },

      ...options,
    };
  }, [
    options,
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

  return (
    <div
      className="w-full h-full"
      style={{
        background: backgroundColor,
        color: textColor,
      }}
    >
      <ReactApexChart
        options={mergedOptions}
        series={resolvedSeries}
        type={type}
        height={height || "100%"}
        width={width || "100%"}
      />
    </div>
  );
};

export default ChartPageStats;