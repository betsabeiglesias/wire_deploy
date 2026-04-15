import HmiHorizontalGauge from "../standard/HmiHorizontalGauge";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default {
  type:        "hmi-horizontal-gauge",
  label:       "Gauge Horizontal",
  category:    "gauges",
  icon:        "gauge",
  defaultSize: { w: 240, h: 140 },

  buildProps({ settings, live, width, height }) {
    return {
      value: parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? 0,
      min: settings.min ?? settings.minValue ?? 0,
      max: settings.max ?? settings.maxValue ?? 100,
      variant: settings.variant || "precision",
      accentColor: settings.accentColor,
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle() {
    return {};
  },

  component: HmiHorizontalGauge,
};
