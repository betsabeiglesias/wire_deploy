import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const generateDayWiseTimeSeries = (start, count, { min, max }) => {
  const series = [];
  let x = start;
  for (let i = 0; i < count; i += 1) {
    const y = Math.floor(Math.random() * (max - min + 1)) + min;
    series.push([x, y]);
    x += 24 * 60 * 60 * 1000;
  }
  return series;
};

const buildDefaultState = (startTs) => ({
  line: {
    series: [{ name: "FB", data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }) }],
    options: {
      chart: { id: "fb", group: "social", type: "line", height: 160 },
      colors: ["#008FFB"],
    },
  },
  line2: {
    series: [{ name: "TW", data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 30 }) }],
    options: {
      chart: { id: "tw", group: "social", type: "line", height: 160 },
      colors: ["#546E7A"],
    },
  },
  area: {
    series: [{ name: "YT", data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }) }],
    options: {
      chart: { id: "yt", group: "social", type: "area", height: 160 },
      colors: ["#00E396"],
    },
  },
  small1: {
    series: [{ name: "IG", data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }) }],
    options: {
      chart: { id: "ig", group: "social", type: "area", height: 160 },
      colors: ["#008FFB"],
    },
  },
  small2: {
    series: [{ name: "LI", data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }) }],
    options: {
      chart: { id: "li", group: "social", type: "area", height: 160 },
      colors: ["#546E7A"],
    },
  },
});

const ChartSocialGroup = ({
  settings = {},
  height,
  width,

  backgroundColor,
  textColor,
  gridColor,
  axisColor,
  primaryColor,
  secondaryColor,
}) => {

  const startTs = useMemo(() => new Date("2017-02-11").getTime(), []);
  const defaults = useMemo(() => buildDefaultState(startTs), [startTs]);

  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || 340;

  const chartWidth = width || "100%";

  // 🔥 CLAVE: FORZAR estilos Apex correctamente
  const applyTheme = (baseOptions, overrideOptions = {}, color) => {
    const merged = {
      ...baseOptions,
      ...overrideOptions,
    };

    // 👉 CRÍTICO: sobrescribir SIEMPRE estas props
    merged.chart = {
      ...baseOptions.chart,
      ...overrideOptions.chart,
      background: backgroundColor,
    };

    merged.colors = [color];

    merged.stroke = {
      ...(baseOptions.stroke || {}),
      ...(overrideOptions.stroke || {}),
      width: 2,
    };

    merged.grid = {
      ...(baseOptions.grid || {}),
      ...(overrideOptions.grid || {}),
      borderColor: gridColor,
    };

    merged.xaxis = {
      ...(baseOptions.xaxis || {}),
      ...(overrideOptions.xaxis || {}),
      labels: {
        ...(baseOptions.xaxis?.labels || {}),
        ...(overrideOptions.xaxis?.labels || {}),
        style: { colors: axisColor },
      },
      axisBorder: { color: axisColor },
      axisTicks: { color: axisColor },
    };

    merged.yaxis = {
      ...(baseOptions.yaxis || {}),
      ...(overrideOptions.yaxis || {}),
      labels: {
        ...(baseOptions.yaxis?.labels || {}),
        ...(overrideOptions.yaxis?.labels || {}),
        style: { colors: axisColor },
      },
    };

    merged.tooltip = {
      theme: "dark",
    };

    merged.legend = {
      ...(baseOptions.legend || {}),
      ...(overrideOptions.legend || {}),
      labels: {
        colors: textColor,
      },
    };

    merged.title = {
      ...(baseOptions.title || {}),
      ...(overrideOptions.title || {}),
      style: { color: textColor },
    };

    return merged;
  };

  const resolved = {
    line: {
      series: settings.lineSeries || defaults.line.series,
      options: applyTheme(defaults.line.options, settings.lineOptions, primaryColor),
    },
    line2: {
      series: settings.line2Series || defaults.line2.series,
      options: applyTheme(defaults.line2.options, settings.line2Options, secondaryColor || primaryColor),
    },
    area: {
      series: settings.areaSeries || defaults.area.series,
      options: applyTheme(defaults.area.options, settings.areaOptions, primaryColor),
    },
    small1: {
      series: settings.small1Series || defaults.small1.series,
      options: applyTheme(defaults.small1.options, settings.small1Options, primaryColor),
    },
    small2: {
      series: settings.small2Series || defaults.small2.series,
      options: applyTheme(defaults.small2.options, settings.small2Options, secondaryColor || primaryColor),
    },
  };

  return (
    <div className="w-full h-full flex flex-col gap-2" style={{ width: chartWidth, height: chartHeight }}>
      <ReactApexChart options={resolved.line.options} series={resolved.line.series} type="line" height={160} />
      <ReactApexChart options={resolved.line2.options} series={resolved.line2.series} type="line" height={160} />
      <ReactApexChart options={resolved.area.options} series={resolved.area.series} type="area" height={160} />

      <div className="grid grid-cols-2 gap-2">
        <ReactApexChart options={resolved.small1.options} series={resolved.small1.series} type="area" height={160} />
        <ReactApexChart options={resolved.small2.options} series={resolved.small2.series} type="area" height={160} />
      </div>
    </div>
  );
};

export default ChartSocialGroup;