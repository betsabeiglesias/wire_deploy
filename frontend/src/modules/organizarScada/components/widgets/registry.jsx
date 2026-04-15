import React from "react";
import TempGauge from "@/modules/organizarScada/components/widgets/standard/TempGauge";
import SvgGauge from "@/modules/organizarScada/components/widgets/standard/SvgGauge";
import EnergyBarChart from "@/modules/organizarScada/components/widgets/standard/EnergyBarChart";
import LuxuriesStackedBarChart from "@/modules/organizarScada/components/widgets/standard/LuxuriesStackedBarChart";
import TemperatureLineChart from "@/modules/organizarScada/components/widgets/standard/TemperatureLineChart";
import HmiProgressBar from "@/modules/organizarScada/components/widgets/standard/HmiProgressBar";
import HmiTankLevel from "@/modules/organizarScada/components/widgets/standard/HmiTankLevel";
import HmiStatusCard from "@/modules/organizarScada/components/widgets/standard/HmiStatusCard";
import HmiTrendCard from "@/modules/organizarScada/components/widgets/standard/HmiTrendCard";
import HmiScadaGauge from "@/modules/organizarScada/components/widgets/standard/HmiScadaGauge";
import HmiHorizontalGauge from "@/modules/organizarScada/components/widgets/standard/HmiHorizontalGauge";
import HmiEnergySummaryCard from "@/modules/organizarScada/components/widgets/standard/HmiEnergySummaryCard";

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

import ChartBasic from "@/modules/organizarScada/components/widgets/iconsScada/ChartBasic";
import ChartHighLow from "@/modules/organizarScada/components/widgets/iconsScada/ChartHighLow";
import ChartStockArea from "@/modules/organizarScada/components/widgets/iconsScada/ChartStockArea";
import ChartSocialGroup from "@/modules/organizarScada/components/widgets/iconsScada/ChartSocialGroup";
import ChartRealtime from "@/modules/organizarScada/components/widgets/iconsScada/ChartRealtime";
import ChartPageStats from "@/modules/organizarScada/components/widgets/iconsScada/ChartPageStats";


import {
  buildEnergyBarChartDemo,
  buildTemperatureLineChartDemo,
} from "@/modules/organizarScada/utils/chartDemos";

import {
  parseNumericValue,
  normalizePercent,
} from "@/modules/organizarScada/utils/numbers";

import {
  formatNumericValue,
  formatValueWithDecimals,
} from "@/modules/organizarScada/utils/formatters";

import { resolveWidgetStyle } from "./WidgetStyleRenderer";

/* =========================================================
   🔥 FIX: normalización consistente
========================================================= */
const buildNumericMiniProps = (settings, liveData) => {
  const min = settings.min ?? settings.minValue ?? 0;
  const max = settings.max ?? settings.maxValue ?? 100;

  const rawValue =
    typeof liveData.value !== "undefined"
      ? liveData.value
      : settings.initialValue;

  const numericValue = parseNumericValue(rawValue);

  const fallbackNumeric =
    numericValue ?? parseNumericValue(settings.initialValue) ?? 0;

  const percent = normalizePercent(fallbackNumeric, min, max);
  const formattedValue = formatNumericValue(fallbackNumeric) ?? "-";

  const labelText =
    formattedValue === "-"
      ? "-"
      : liveData.unit
        ? `${formattedValue} ${liveData.unit}`
        : formattedValue;

  return {
    percent,
    formattedValue,
    labelText,
    bubbleValue: formatValueWithDecimals(rawValue),
    unit: liveData.unit,
  };
};

/* =========================================================
   RENDER
========================================================= */
export const renderWidget = ({
  data,
  live,
  width,
  height,
  valueHistory,
  demoNow,
}) => {
  if (!data) return null;
  console.log("[renderWidget DEBUG]", {
    type: data?.type,
    settings: data?.settings,
    live,
  });

  const settings = data.settings || {};
  const history = valueHistory || [];

  
  const label =
    settings.attributeLabel ||
    settings.label ||
    data.label ||
    "";

  const min = settings.min ?? settings.minValue ?? 0;
  const max = settings.max ?? settings.maxValue ?? 100;

  const unit = live.unit || settings.unit || "";

  const style = resolveWidgetStyle(data.type, settings);

  switch (data.type) {
    /* =========================================================
       MINI WIDGETS
    ========================================================= */
    case "mini-ring":
    case "mini-horizontal":
    case "mini-donut":
    case "mini-bubble": {
      const numericProps = buildNumericMiniProps(settings, live);

      const content =
        data.type === "mini-horizontal" ? (
          <MiniHorizontalBar
            percent={numericProps.percent}
            label={numericProps.labelText}
            {...style}
          />
        ) : data.type === "mini-donut" ? (
          <BlueDonutGauge
            percent={numericProps.percent}
            label={numericProps.labelText}
            {...style} 
          />
        ) : data.type === "mini-bubble" ? (
          <ValueBubble
            value={numericProps.bubbleValue}
            unit={numericProps.unit}
            {...style}
          />
        ) : (
          <RingGauge
            percent={numericProps.percent}
            displayValue={numericProps.formattedValue}
            unit={numericProps.unit}
            {...style}
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
      const numericProps = buildNumericMiniProps(settings, live);

      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <NeedleGauge
            percent={numericProps.percent}
            value={numericProps.formattedValue}
            unit={numericProps.unit}
            {...style} 
          />
        </div>
      );
    }

    case "mini-lamp": {
      const boolValue =
        typeof live.value === "boolean"
          ? live.value
          : Boolean(settings.initialValue ?? false);

      return (
        <div className="scada-mini-widget">
          <div className="scada-mini-title">{label}</div>
          <BooleanLamp active={boolValue} />
        </div>
      );
    }

    /* =========================================================
       GAUGES
    ========================================================= */
    case "temp-gauge": {
      const value =
        parseNumericValue(live.value) ??
        settings.initialValue ??
        0;

      return (
          <TempGauge
            value={value}
            min={min}
            max={max}
            label={label}
            unit={unit || "C"}
            size={Math.min(width, height)}
            {...style}
          />
      );
    }

    case "hmi-progress-bar": {
      const value =
        parseNumericValue(live.value) ??
        parseNumericValue(settings.initialValue) ??
        0;

      const percent = normalizePercent(value, min, max);

      return (
        <HmiProgressBar
          percent={percent}
          label={settings.caption || label}
          width={width}
          height={height}
          {...style}        
        />
      );
    }

    case "hmi-tank-level": {
      const value =
        parseNumericValue(live.value) ??
        parseNumericValue(settings.initialValue) ??
        0;

      const percent = normalizePercent(value, min, max);

      return (
        <HmiTankLevel
          percent={percent}
          width={width}
          height={height}
          label={label}
        />
      );
    }

    case "hmi-scada-gauge": {
      const value =
        parseNumericValue(live.value) ??
        parseNumericValue(settings.initialValue) ??
        0;

       return (
    <HmiScadaGauge
      value={value}
      min={min}
      max={max}
      unit={unit}
      width={width}
      height={height}
      {...style}          
    />
  );
    }

    /* =========================================================
       CHARTS
    ========================================================= */
    case "energy-bar-chart": {
      const demo = buildEnergyBarChartDemo({ now: demoNow, settings });

      return (
        <EnergyBarChart
          title={settings.title || label}
          bars={settings.series || demo.bars}
          width={width}
          height={height}
        />
      );
    }

    case "temperature-line-chart": {
      const demo = buildTemperatureLineChartDemo({ now: demoNow, settings });

      return (
        <TemperatureLineChart
          label={settings.legendLabel || label}
          series={settings.series || demo.series}
        />
      );
    }

    /* =========================================================
      IMAGE / MEDIA WIDGET
    ========================================================= */
    case "image-widget":
    case "image":
    case "img":
    case "picture":
    case "asset-image": {
      const src =
        settings.imageBase64 ||
        live?.value ||
        settings.src ||
        settings.url ||
        settings.image ||
        settings.path;

      if (!src) {
        return (
          <div className="p-2 text-gray-400">
            Sin imagen
          </div>
        );
      }

      // opcion 1:
    //   return (
    //     <div
    //       style={{
    //         width: "100%",
    //         height: "100%",
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       <img
    //         src={src}
    //         alt={label}
    //         style={{
    //           maxWidth: "100%",
    //           maxHeight: "100%",
    //           objectFit: "contain",
    //         }}
    //       />
    //     </div>
    //   );
    // }

        // opcion 2:
    return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={src}
            alt={label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      );
    }


    /* =========================================================
       DEFAULT
    ========================================================= */
    default:
      return (
        <div className="p-2 text-gray-600">
          {label}
        </div>
      );
  }
};

