import HmiTankLevel from "../bars/HmiTankLevel";
import { parseNumericValue, normalizePercent } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type: "hmi-tank-level",
  label: "Nivel de Tanque",
  category: "gauges",
  icon: "tank",
  defaultSize: { w: 150, h: 200 },

  buildProps({ settings, live, width, height }) {
    const min = settings.min ?? settings.minValue ?? 0;
    const max = settings.max ?? settings.maxValue ?? 100;
    const value =
      parseNumericValue(live.value) ??
      parseNumericValue(settings.initialValue) ??
      0;

    const percent = normalizePercent(value, min, max);
    const label =
      settings.attributeLabel ||
      settings.label ||
      "";

    return { percent, width, height, label };
  },

  styleSchema: [],

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      textColor: base.titleColor,
      primaryColor: base.primary,
      secondaryColor: base.primaryDark,
    };
  },

  component: HmiTankLevel,
};