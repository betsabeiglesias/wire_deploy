import HmiTankLevel from "../standard/HmiTankLevel";
import { parseNumericValue, normalizePercent } from "@/modules/organizarScada/utils/numbers";

export default {
  type:        "hmi-tank-level",
  label:       "Nivel de Tanque",
  category:    "gauges",
  icon:        "tank",
  defaultSize: { w: 150, h: 200 },

  buildProps({ settings, live, width, height }) {
    const min     = settings.min ?? settings.minValue ?? 0;
    const max     = settings.max ?? settings.maxValue ?? 100;
    const value   = parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? 0;
    const percent = normalizePercent(value, min, max);
    const label   = settings.attributeLabel || settings.label || "";
    return { percent, width, height, label };
  },

  styleSchema: [
    {
      group: "Nivel",
      fields: [
        { key: "primary",   label: "Color líquido",   type: "color" },
        { key: "secondary", label: "Color gradiente", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color valor", type: "color" },
      ],
    },
  ],

  resolveStyle(palette) {
    return {
      fluidBase:    palette.primary   || "#8e44ad",
      gradientFrom: palette.primary   || "#9b59b6",
      gradientTo:   palette.secondary || "#8e44ad",
      labelColor:   palette.text      || "#e2e8f0",
    };
  },

  component: HmiTankLevel,
};
