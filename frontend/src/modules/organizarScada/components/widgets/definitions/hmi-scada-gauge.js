import HmiScadaGauge from "../gauges/HmiScadaGauge";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type: "hmi-scada-gauge",
  label: "SCADA Gauge",
  category: "gauges",
  icon: "gauge",
  defaultSize: { w: 220, h: 220 },

  buildProps({ settings, live, width, height }) {
    const min = settings.min ?? settings.minValue ?? 0;
    const max = settings.max ?? settings.maxValue ?? 100;

    const value =
      parseNumericValue(live.value) ??
      parseNumericValue(settings.initialValue) ??
      0;

    const unit = live.unit || settings.unit || "";

    return {
      value,
      min,
      max,
      unit,
      width,
      height,
      zones: settings.zones || [],
      showValue: settings.showValue ?? true,
      showLabel: settings.showLabel ?? true,
      valueOffsetX: settings.valueOffsetX ?? 0,
      valueOffsetY: settings.valueOffsetY ?? 0,
      unitOffsetX: settings.unitOffsetX ?? 0,
      unitOffsetY: settings.unitOffsetY ?? 0,
    };
  },

  styleSchema: [],

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      primaryColor: base.primary,
      secondaryColor: base.primaryDark,
      valueColor: base.primary,
      unitColor: base.axisColor,
    };
  },

  component: HmiScadaGauge,
};