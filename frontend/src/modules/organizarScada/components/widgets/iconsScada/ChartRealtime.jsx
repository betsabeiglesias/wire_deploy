import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

const XAXIS_RANGE = 90 * 1000;

const randomInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateSeedSeries = (points = 20, opts = { min: 10, max: 90 }) => {
  const base = new Date().getTime();
  return Array.from({ length: points }, (_, i) => [
    base - (points - i) * 1000,
    randomInRange(opts.min, opts.max),
  ]);
};

const ChartRealtime = ({
  settings = {},
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

  const seed = useMemo(
    () => settings.series?.[0]?.data || generateSeedSeries(),
    [settings.series],
  );

  const [series, setSeries] = useState([
    {
      name: settings.series?.[0]?.name || "Realtime",
      data: seed,
    },
  ]);

  const lastDateRef = useRef(seed[seed.length - 1]?.[0] || new Date().getTime());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const newTs = lastDateRef.current + 1000;
      const newVal = randomInRange(
        settings.randomMin ?? 10,
        settings.randomMax ?? 90,
      );
      lastDateRef.current = newTs;

      setSeries((prev) => {
        const nextData = [...prev[0].data, [newTs, newVal]].slice(-200);
        return [{ ...prev[0], data: nextData }];
      });
    }, settings.intervalMs ?? 1000);

    return () => window.clearInterval(interval);
  }, [settings.randomMin, settings.randomMax, settings.intervalMs]);

  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || 300;

  const chartWidth = Number.isFinite(Number(width))
    ? Number(width)
    : width || "100%";

  const mergedOptions = useMemo(() => {
    const baseOptions = {
      chart: {
        id: "realtime",
        type: "line",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: settings.animationSpeed ?? 1000,
          },
        },
        toolbar: { show: false },
        zoom: { enabled: false },
        background: backgroundColor,
      },
      colors: [primaryColor, secondaryColor],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      title: {
        text: settings.title || "Dynamic Updating Chart",
        align: "left",
        style: { color: textColor },
      },
      markers: { size: 0 },
      xaxis: {
        type: "datetime",
        range: settings.xaxisRange ?? XAXIS_RANGE,
        labels: {
          style: { colors: axisColor },
        },
        axisBorder: { color: axisColor },
        axisTicks: { color: axisColor },
      },
      yaxis: {
        max: settings.yMax ?? 100,
        labels: {
          style: { colors: axisColor },
        },
      },
      grid: {
        borderColor: gridColor,
      },
      legend: {
        show: false,
        labels: {
          colors: textColor,
        },
      },
    };

    const opt = {
      ...baseOptions,
      ...(settings.options || {}),
    };

    opt.chart = { ...baseOptions.chart, ...(settings.options?.chart || {}) };
    opt.xaxis = { ...baseOptions.xaxis, ...(settings.options?.xaxis || {}) };
    opt.yaxis = { ...baseOptions.yaxis, ...(settings.options?.yaxis || {}) };
    opt.stroke = { ...baseOptions.stroke, ...(settings.options?.stroke || {}) };
    opt.title = { ...baseOptions.title, ...(settings.options?.title || {}) };

    return opt;
  }, [
    settings,
    backgroundColor,
    textColor,
    gridColor,
    axisColor,
    primaryColor,
    secondaryColor,
  ]);

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
        series={series}
        type={type}
        height={chartHeight}
        width={chartWidth}
      />
    </div>
  );
};

export default ChartRealtime;