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

const ChartStockArea = ({
  series,
  options,
  height,
  width,
  type = "area",

  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
}) => {

  const mergedOptions = useMemo(() => {
    const opts = {
      chart: {
        type,
        background: backgroundColor,
        zoom: { enabled: true },
        toolbar: { autoSelected: "zoom" },
      },
      colors: [primaryColor],
      dataLabels: { enabled: false },
      markers: { size: 0 },
      stroke: { curve: "smooth" },

      title: {
        text: "Stock Price Movement",
        align: "left",
        style: { color: textColor },
      },

      grid: {
        borderColor: gridColor,
      },

      xaxis: {
        type: "datetime",
        labels: { style: { colors: axisColor } },
      },

      yaxis: {
        labels: {
          style: { colors: axisColor },
          formatter: (val) => (val / 1_000_000).toFixed(0),
        },
      },

      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },

      tooltip: {
        theme: "dark",
      },

      ...(options || {}),
    };

    return opts;
  }, [options, backgroundColor, textColor, gridColor, axisColor, primaryColor, type]);

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