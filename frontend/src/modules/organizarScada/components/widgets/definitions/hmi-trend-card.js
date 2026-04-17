import HmiTrendCard from "../standard/HmiTrendCard";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "hmi-trend-card",
  label:       "Tarjeta de Tendencia",
  category:    "tarjetas",
  icon:        "card",
  defaultSize: { w: 400, h: 220 },

  buildProps({ settings, live, width, height, valueHistory }) {
    return {
      title: settings.title || settings.label,
      value: parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? settings.value ?? 0,
      unitLabel: settings.unitLabel || settings.unit || "",
      minValue: settings.minValue ?? 0,
      maxValue: settings.maxValue ?? 100,
      series: settings.series || valueHistory || [],
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      textColor: base.titleColor,

      gridColor: base.gridColor,
      axisColor: base.axisColor,

      primaryColor: base.primary,
      secondaryColor: base.primaryDark,
    };
  },

  component: HmiTrendCard,
};
