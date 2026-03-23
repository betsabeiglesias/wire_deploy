import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const generateDayWiseTimeSeries = (start, count, { min, max }) => {
  const series = [];
  let x = start;
  for (let i = 0; i < count; i += 1) {
    const y = Math.floor(Math.random() * (max - min + 1)) + min;
    series.push([x, y]);
    x += 24 * 60 * 60 * 1000; // +1 day
  }
  return series;
};

const buildDefaultState = (startTs) => ({
  line: {
    series: [
      {
        name: "FB",
        data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }),
      },
    ],
    options: {
      chart: { id: "fb", group: "social", type: "line", height: 160 },
      colors: ["#008FFB"],
    },
  },
  line2: {
    series: [
      {
        name: "TW",
        data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 30 }),
      },
    ],
    options: {
      chart: { id: "tw", group: "social", type: "line", height: 160 },
      colors: ["#546E7A"],
    },
  },
  area: {
    series: [
      {
        name: "YT",
        data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }),
      },
    ],
    options: {
      chart: { id: "yt", group: "social", type: "area", height: 160 },
      colors: ["#00E396"],
    },
  },
  small1: {
    series: [
      {
        name: "IG",
        data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }),
      },
    ],
    options: {
      chart: { id: "ig", group: "social", type: "area", height: 160 },
      colors: ["#008FFB"],
    },
  },
  small2: {
    series: [
      {
        name: "LI",
        data: generateDayWiseTimeSeries(startTs, 20, { min: 10, max: 60 }),
      },
    ],
    options: {
      chart: { id: "li", group: "social", type: "area", height: 160 },
      colors: ["#546E7A"],
    },
  },
});

/**
 * ChartSocialGroup
 * Conjunto de 5 gráficos sincronizados por grupo "social".
 * Acepta overrides en settings: lineOptions, lineSeries, areaOptions, etc.
 */
const ChartSocialGroup = ({
  settings = {},
  height,
  width,
}) => {
  const startTs = useMemo(
    () => new Date("2017-02-11").getTime(),
    []
  );

  const defaults = useMemo(() => buildDefaultState(startTs), [startTs]);

  const chartHeight = Number.isFinite(Number(height))
    ? Number(height)
    : height || 340;
  const chartWidth = width || "100%";

  const resolved = {
    line: {
      series: settings.lineSeries || defaults.line.series,
      options: {
        ...defaults.line.options,
        ...(settings.lineOptions || {}),
      },
    },
    line2: {
      series: settings.line2Series || defaults.line2.series,
      options: {
        ...defaults.line2.options,
        ...(settings.line2Options || {}),
      },
    },
    area: {
      series: settings.areaSeries || defaults.area.series,
      options: {
        ...defaults.area.options,
        ...(settings.areaOptions || {}),
      },
    },
    small1: {
      series: settings.small1Series || defaults.small1.series,
      options: {
        ...defaults.small1.options,
        ...(settings.small1Options || {}),
        chart: {
          ...defaults.small1.options.chart,
          ...(settings.small1Options?.chart || {}),
          height: settings.small1Options?.chart?.height || 160,
          width: settings.small1Options?.chart?.width || 300,
        },
      },
    },
    small2: {
      series: settings.small2Series || defaults.small2.series,
      options: {
        ...defaults.small2.options,
        ...(settings.small2Options || {}),
        chart: {
          ...defaults.small2.options.chart,
          ...(settings.small2Options?.chart || {}),
          height: settings.small2Options?.chart?.height || 160,
          width: settings.small2Options?.chart?.width || 300,
        },
      },
    },
  };

  const stackGap = 8;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ gap: `${stackGap}px`, width: chartWidth, height: chartHeight }}
    >
      <div className="grid grid-cols-1 gap-2">
        <ReactApexChart
          options={resolved.line.options}
          series={resolved.line.series}
          type="line"
          height={resolved.line.options.chart?.height || 160}
          width="100%"
        />
        <ReactApexChart
          options={resolved.line2.options}
          series={resolved.line2.series}
          type="line"
          height={resolved.line2.options.chart?.height || 160}
          width="100%"
        />
        <ReactApexChart
          options={resolved.area.options}
          series={resolved.area.series}
          type="area"
          height={resolved.area.options.chart?.height || 160}
          width="100%"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ReactApexChart
          options={resolved.small1.options}
          series={resolved.small1.series}
          type={resolved.small1.options.chart?.type || "area"}
          height={resolved.small1.options.chart?.height || 160}
          width={resolved.small1.options.chart?.width || "100%"}
        />
        <ReactApexChart
          options={resolved.small2.options}
          series={resolved.small2.series}
          type={resolved.small2.options.chart?.type || "area"}
          height={resolved.small2.options.chart?.height || 160}
          width={resolved.small2.options.chart?.width || "100%"}
        />
      </div>
    </div>
  );
};

export default ChartSocialGroup;
