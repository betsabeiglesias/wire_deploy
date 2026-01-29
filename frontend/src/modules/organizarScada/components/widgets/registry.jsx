import React from "react";
import TempGauge from "@/modules/organizarScada/components/widgets/standard/TempGauge";
import GaugeMeter from "@/modules/organizarScada/components/widgets/standard/GaugeMeter";
import SvgGauge from "@/modules/organizarScada/components/widgets/standard/SvgGauge";
import EnergyBarChart from "@/modules/organizarScada/components/widgets/standard/EnergyBarChart";
import TemperatureLineChart from "@/modules/organizarScada/components/widgets/standard/TemperatureLineChart";
import HmiProgressBar from "@/modules/organizarScada/components/widgets/standard/HmiProgressBar";
import HmiTankLevel from "@/modules/organizarScada/components/widgets/standard/HmiTankLevel";
import HmiStatusCard from "@/modules/organizarScada/components/widgets/standard/HmiStatusCard";
import HmiTrendCard from "@/modules/organizarScada/components/widgets/standard/HmiTrendCard";
import HmiScadaGauge from "@/modules/organizarScada/components/widgets/standard/HmiScadaGauge";
import HmiHorizontalGauge from "@/modules/organizarScada/components/widgets/standard/HmiHorizontalGauge";
import RingGauge from "@/modules/organizarScada/components/widgets/mini/RingGauge";
import MiniHorizontalBar from "@/modules/organizarScada/components/widgets/mini/MiniHorizontalBar";
import BlueDonutGauge from "@/modules/organizarScada/components/widgets/mini/BlueDonutGauge";
import ValueBubble from "@/modules/organizarScada/components/widgets/mini/ValueBubble";
import BooleanLamp from "@/modules/organizarScada/components/widgets/mini/BooleanLamp";
import NeedleGauge from "@/modules/organizarScada/components/widgets/mini/NeedleGauge";
import KwShieldGauge from "@/modules/organizarScada/components/widgets/mini/KwShieldGauge";
import PressTrendGauge from "@/modules/organizarScada/components/widgets/mini/PressTrendGauge";
import MiniTable from "@/modules/organizarScada/components/widgets/mini/MiniTable";
import MiniTrendChart from "@/modules/organizarScada/components/widgets/mini/MiniTrendChart";
import { parseNumericValue, normalizePercent } from "@/modules/organizarScada/utils/numbers";
import { formatNumericValue, formatValueWithDecimals } from "@/modules/organizarScada/utils/formatters";

const buildNumericMiniProps = (settings, liveData) => {
  const min = typeof settings.minValue !== "undefined" ? settings.minValue : 0;
  const max = typeof settings.maxValue !== "undefined" ? settings.maxValue : 100;
  const rawValue =
    typeof liveData.value !== "undefined" ? liveData.value : settings.initialValue;
  const numericValue = parseNumericValue(rawValue);
  const fallbackNumeric = numericValue ?? parseNumericValue(settings.initialValue) ?? 0;
  const percent = normalizePercent(fallbackNumeric, min, max);
  const formattedValue = formatNumericValue(fallbackNumeric) ?? "-";
  const labelText =
    formattedValue === "-"
      ? "-"
      : liveData.unit
      ? `${formattedValue} ${liveData.unit}`
      : formattedValue;
  const bubbleValue = formatValueWithDecimals(rawValue);
  return {
    percent,
    formattedValue,
    labelText,
    bubbleValue,
    unit: liveData.unit,
  };
};

export const renderWidget = ({ data, live, width, height, theme, valueHistory }) => {
  if (!data) return null;
  const settings = data.settings || {};
  const history = valueHistory || [];

  switch (data.type) {
    case "speedometer":
    case "temperature-gauge": {
      const isThermo = data.type === "temperature-gauge";
      return (
        <div className="w-full h-full flex flex-col items-center">
          <GaugeMeter
            initialValue={
              typeof live.value !== "undefined" ? live.value : settings.initialValue ?? 0
            }
            minValue={typeof settings.minValue !== "undefined" ? settings.minValue : 0}
            maxValue={
              typeof settings.maxValue !== "undefined" ? settings.maxValue : 100
            }
            label={settings.attributeLabel || data.label}
            unit={live.unit}
            showInput={false}
            showScroll={false}
            width={width - 20}
            height={height - 50}
            theme={theme}
            isThermometer={isThermo}
          />
        </div>
      );
    }
    case "mini-ring":
    case "mini-horizontal":
    case "mini-donut":
    case "mini-bubble": {
      const label = settings.attributeLabel || data.label;
      const numericProps = buildNumericMiniProps(settings, live);
      const content =
        data.type === "mini-horizontal" ? (
          <MiniHorizontalBar
            percent={numericProps.percent}
            label={numericProps.labelText}
          />
        ) : data.type === "mini-donut" ? (
          <BlueDonutGauge percent={numericProps.percent} label={numericProps.labelText} />
        ) : data.type === "mini-bubble" ? (
          <ValueBubble value={numericProps.bubbleValue} unit={numericProps.unit} />
        ) : (
          <RingGauge
            percent={numericProps.percent}
            displayValue={numericProps.formattedValue}
            unit={numericProps.unit}
          />
        );
      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          {content}
        </div>
      );
    }
    case "mini-needle": {
      const label = settings.attributeLabel || data.label;
      const numericProps = buildNumericMiniProps(settings, live);
      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <NeedleGauge
            percent={numericProps.percent}
            value={numericProps.formattedValue}
            unit={numericProps.unit}
          />
        </div>
      );
    }
    case "power-card": {
      const label = settings.attributeLabel || data.label;
      const numericProps = buildNumericMiniProps(settings, live);
      return (
        <KwShieldGauge
          value={numericProps.formattedValue}
          unit={numericProps.unit}
          label={label}
        />
      );
    }
    case "press-card": {
      const label = settings.attributeLabel || data.label;
      const numericProps = buildNumericMiniProps(settings, live);
      return (
        <PressTrendGauge
          value={numericProps.formattedValue}
          unit={numericProps.unit}
          label={label}
          trend={numericProps.percent - 50}
        />
      );
    }
    case "mini-lamp": {
      const label = settings.attributeLabel || data.label;
      const boolValue =
        typeof live.value === "boolean"
          ? live.value
          : Boolean(
              typeof settings.initialValue !== "undefined" ? settings.initialValue : false
            );
      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <BooleanLamp active={boolValue} />
        </div>
      );
    }
    case "mini-table": {
      const label = settings.attributeLabel || data.label;
      const fallbackRow =
        typeof live.value !== "undefined"
          ? [
              {
                site: live.site || settings.site,
                equipment: live.equipment || settings.equipment,
                variable: live.variable || settings.attributeKey || data.label,
                value: formatValueWithDecimals(live.value),
                timestamp: live.timestamp || new Date().toISOString(),
              },
            ]
          : [];
      const tableRows = history.length
        ? [...history]
            .slice(-10)
            .reverse()
            .map((entry) => ({
              site: entry.site || settings.site,
              equipment: entry.equipment || settings.equipment,
              variable: entry.variable || settings.attributeKey || data.label,
              value: entry.displayValue ?? formatValueWithDecimals(entry.value),
              timestamp: entry.timestamp,
            }))
        : settings.rows || fallbackRow;
      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <MiniTable rows={tableRows} />
        </div>
      );
    }
    case "mini-chart": {
      const label = settings.attributeLabel || data.label;
      const historySeries = history
        .map((entry) => entry.numericValue)
        .filter((val) => typeof val === "number");
      const fallbackSeries =
        typeof live.value !== "undefined"
          ? [parseNumericValue(live.value)].filter((val) => typeof val === "number")
          : settings.series || [];
      const series = historySeries.length >= 2 ? historySeries : fallbackSeries;
      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <MiniTrendChart series={series} />
        </div>
      );
    }
    case "svg-gauge": {
      const valueToRender =
        typeof live.value !== "undefined" ? live.value : data.gaugeOptions?.value ?? 0;
      return (
        <SvgGauge
          options={data.gaugeOptions}
          value={valueToRender}
          className={data.className}
          width={width}
          height={height}
        />
      );
    }
    case "temp-gauge": {
      const valueToRender =
        typeof live.value !== "undefined"
          ? parseNumericValue(live.value)
          : settings.initialValue ?? 89;

      return (
        <TempGauge
          value={valueToRender}
          min={settings.min ?? 0}
          max={settings.max ?? 120}
          label={settings.label || data.label}
          unit={live.unit || settings.unit || "??C"}
          size={Math.min(width, height)}
        />
      );
    }
    case "energy-bar-chart": {
      return (
        <EnergyBarChart
          title={settings.title || data.label}
          valueText={settings.valueText || "420 kW"}
        />
      );
    }
    case "temperature-line-chart": {
      return (
        <TemperatureLineChart
          label={settings.legendLabel || "Temp °C"}
          pointLabel={settings.pointLabel || "55ºC"}
        />
      );
    }
    case "hmi-progress-bar": {
      const min =
        typeof settings.minValue !== "undefined" ? settings.minValue : 0;
      const max =
        typeof settings.maxValue !== "undefined" ? settings.maxValue : 100;
      const rawValue =
        typeof live.value !== "undefined" ? live.value : settings.initialValue;
      const numericValue =
        parseNumericValue(rawValue) ??
        parseNumericValue(settings.initialValue) ??
        0;
      const percent = normalizePercent(numericValue, min, max);
      return (
        <HmiProgressBar
          percent={percent}
          label={settings.caption || data.label || "LOREM IPSUM"}
          width={width}
          height={height}
        />
      );
    }
    case "hmi-tank-level": {
      const min =
        typeof settings.minValue !== "undefined" ? settings.minValue : 0;
      const max =
        typeof settings.maxValue !== "undefined" ? settings.maxValue : 100;
      const rawValue =
        typeof live.value !== "undefined" ? live.value : settings.initialValue;
      const numericValue =
        parseNumericValue(rawValue) ??
        parseNumericValue(settings.initialValue) ??
        0;
      const percent = normalizePercent(numericValue, min, max);
      return <HmiTankLevel percent={percent} width={width} height={height} />;
    }
    case "hmi-status-card": {
      const status = settings.status || "ok";
      const title = settings.title || data.label || "SISTEMA OK";
      const subtitle = settings.subtitle || "STATUS: READY";
      return (
        <HmiStatusCard
          status={status}
          title={title}
          subtitle={subtitle}
          width={width}
          height={height}
        />
      );
    }
    case "hmi-trend-card": {
      const title = settings.title || data.label || "Caudal de Proceso - Cuba 2";
      const unitLabel = settings.unitLabel || "LOREM IPSUM";
      const minValue =
        typeof settings.minValue !== "undefined" ? settings.minValue : 0;
      const maxValue =
        typeof settings.maxValue !== "undefined" ? settings.maxValue : 10000;
      const rawValue =
        typeof live.value !== "undefined" ? live.value : settings.initialValue;
      const numericValue =
        parseNumericValue(rawValue) ??
        parseNumericValue(settings.initialValue) ??
        0;
      const series = Array.isArray(settings.series) ? settings.series : [];
      return (
        <HmiTrendCard
          title={title}
          unitLabel={unitLabel}
          value={numericValue}
          minValue={minValue}
          maxValue={maxValue}
          series={series}
          width={width}
          height={height}
        />
      );
    }
    case "hmi-scada-gauge": {
      const min = typeof settings.min !== "undefined" ? settings.min : 0;
      const max = typeof settings.max !== "undefined" ? settings.max : 100;
      const rawValue =
        typeof live.value !== "undefined" ? live.value : settings.initialValue;
      const numericValue =
        parseNumericValue(rawValue) ??
        parseNumericValue(settings.initialValue) ??
        0;
      const zones = Array.isArray(settings.zones) ? settings.zones : [];
      return (
        <HmiScadaGauge
          value={numericValue}
          min={min}
          max={max}
          unit={settings.unit || ""}
          themeColor={settings.themeColor || "#94a3b8"}
          zones={zones}
          width={width}
          height={height}
        />
      );
    }
    case "hmi-horizontal-gauge": {
      const min = typeof settings.min !== "undefined" ? settings.min : 0;
      const max = typeof settings.max !== "undefined" ? settings.max : 100;
      const rawValue =
        typeof live.value !== "undefined" ? live.value : settings.initialValue;
      const numericValue =
        parseNumericValue(rawValue) ??
        parseNumericValue(settings.initialValue) ??
        0;
      return (
        <HmiHorizontalGauge
          value={numericValue}
          min={min}
          max={max}
          variant={settings.variant || "precision"}
          accentColor={settings.accentColor}
          width={width}
          height={height}
        />
      );
    }
    case "nav-button": {
      const label = data.label || "Boton";
      const variantClass =
        data.variant === "btn-outline"
          ? "border border-sky-500 text-sky-700 hover:bg-sky-50"
          : "bg-sky-600 hover:bg-sky-700 text-white";
      return (
        <button
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition cursor-default ${variantClass}`}
          onClick={(e) => e.preventDefault()}
          title="Bot?n de navegaci?n (activo solo en Producci?n)"
        >
          {label}
          {data.targetViewId && (
            <span className="ml-2 inline-flex items-center rounded bg-white/20 px-2 py-0.5 text-[10px] font-normal">
              {data.targetViewId}
            </span>
          )}
        </button>
      );
    }
    case "label-pill": {
      const label = data.label || "Label";
      return (
        <div className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs px-3 py-0.5 border border-emerald-100">
          {label}
        </div>
      );
    }
    case "label-badge": {
      const label = data.label || "Badge";
      return (
        <div className="inline-flex items-center rounded bg-slate-800 text-slate-50 text-[10px] px-2 py-0.5 uppercase tracking-wide">
          {label}
        </div>
      );
    }
    case "card-soft":
    case "card-elevated": {
      const label = data.label || "Caja";
      const elevated = data.type === "card-elevated";
      return (
        <div
          className={[
            "w-full h-full rounded-lg border px-3 py-2 text-slate-700 text-sm flex items-center",
            elevated ? "bg-white shadow-md" : "bg-slate-50 shadow-sm",
          ].join(" ")}
        >
          {label}
        </div>
      );
    }
    default:
      return <div className="p-2 text-gray-600">Componente: {data.label}</div>;
  }
};
