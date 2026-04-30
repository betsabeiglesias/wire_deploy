import TempGauge from "../gauges/TempGauge";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type: "temp-gauge",
  label: "Temperatura",
  category: "gauges",
  icon: "temperature",
  defaultSize: { w: 160, h: 160 },

  buildProps({ settings, live, width, height }) {
    const min = settings.min ?? settings.minValue ?? 0;
    const max = settings.max ?? settings.maxValue ?? 140;
    const value =
      parseNumericValue(live.value) ??
      settings.initialValue ??
      0;

    const label = settings.attributeLabel || settings.label || "";
    const unit = live.unit || settings.unit || "C";

    return {
      value,
      min,
      max,
      label,
      unit,
      size: Math.min(width, height),
    };
  },

  styleSchema: [],

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      labelColor: base.labelColor,
      valueColor: base.primary,
      needleColor: base.titleColor,
      tickColor: base.axisColor,
      arcStartColor: base.primary,
      arcMidColor: base.primaryDark,
      arcEndColor: base.danger,
      minMaxColor: base.axisColor,
    };
  },

  component: TempGauge,
};