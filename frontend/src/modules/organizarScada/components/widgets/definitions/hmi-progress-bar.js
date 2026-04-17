import HmiProgressBar from "../standard/HmiProgressBar";
import { parseNumericValue, normalizePercent } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "hmi-progress-bar",
  label:       "Barra de Progreso",
  category:    "barras",
  icon:        "gauge",
  defaultSize: { w: 200, h: 60 },

  buildProps({ settings, live, width, height }) {
    const min     = settings.min ?? settings.minValue ?? 0;
    const max     = settings.max ?? settings.maxValue ?? 100;
    const value   = parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? 0;
    const percent = normalizePercent(value, min, max);
    const label   = settings.caption || settings.attributeLabel || settings.label || "";
    return { percent, label, width, height };
  },

  styleSchema: [
    {
      group: "Barra",
      fields: [
        { key: "primary",   label: "Color barra",     type: "color" },
        { key: "secondary", label: "Color degradado", type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text", label: "Color texto", type: "color" },
      ],
    },
  ],

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

  component: HmiProgressBar,
};
