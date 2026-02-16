const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNum = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const wave = (now, speed, phase = 0) =>
  Math.sin(now / speed + phase) + 0.35 * Math.sin(now / (speed * 0.55) + phase * 0.7);

export const CHART_DEMO_TYPES = new Set([
  "energy-bar-chart",
  "temperature-line-chart",
]);

export const isChartDemoType = (type) => CHART_DEMO_TYPES.has(type);

export const buildEnergyBarChartDemo = ({ now = Date.now(), settings = {} } = {}) => {
  const count = toNum(settings.demoBarsCount, 6);
  const min = toNum(settings.demoMin, 280);
  const max = toNum(settings.demoMax, 1500);
  const span = Math.max(120, max - min);

  const bars = Array.from({ length: Math.max(3, count) }, (_, idx) => {
    const base = wave(now - idx * 12000, 5200, idx * 0.8);
    const normalized = (base + 1.6) / 3.2;
    return Math.round(clamp(min + normalized * span, min, max));
  });

  const labels = Array.from({ length: bars.length }, (_, idx) => {
    const date = new Date(now - (bars.length - 1 - idx) * 60 * 60 * 1000);
    const hh = String(date.getHours()).padStart(2, "0");
    return `${hh}:00`;
  });

  const latest = bars[bars.length - 1] || 0;
  const limitValue = toNum(settings.limitValue, Math.round(max * 0.84));

  return {
    bars,
    labels,
    valueText: `${latest} kW`,
    limitValue,
    maxScale: Math.max(max, ...bars, limitValue),
  };
};

export const buildTemperatureLineChartDemo = ({
  now = Date.now(),
  settings = {},
} = {}) => {
  const points = Math.max(5, toNum(settings.demoPoints, 9));
  const min = toNum(settings.demoMinTemp, 15);
  const max = toNum(settings.demoMaxTemp, 95);
  const span = Math.max(10, max - min);

  const series = Array.from({ length: points }, (_, idx) => {
    const base = wave(now - idx * 240000, 9000, idx * 0.35);
    const normalized = (base + 1.6) / 3.2;
    return Number(clamp(min + normalized * span, min, max).toFixed(1));
  });

  const latest = series[series.length - 1] ?? 0;
  return {
    series,
    pointLabel: `${Math.round(latest)}°C`,
    yMin: min,
    yMax: max,
  };
};
