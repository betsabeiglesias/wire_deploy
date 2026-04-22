import TempGauge from "../standard/TempGauge";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "temp-gauge",
  label:       "Temperatura",
  category:    "gauges",
  icon:        "temperature",
  defaultSize: { w: 160, h: 160 },

  buildProps({ settings, live, width, height }) {
    const min   = settings.min ?? settings.minValue ?? 0;
    const max   = settings.max ?? settings.maxValue ?? 140;
    const value = parseNumericValue(live.value) ?? settings.initialValue ?? 0;
    const label = settings.attributeLabel || settings.label || "";
    const unit  = live.unit || settings.unit || "C";
    return { value, min, max, label, unit, size: Math.min(width, height) };
  },

  styleSchema: [
    {
      group: "Gauge",
      fields: [
        { key: "primary", label: "Color arco inicio", type: "color" },
        { key: "secondary", label: "Color arco fin",  type: "color" },
      ],
    },
    {
      group: "Texto",
      fields: [
        { key: "text",  label: "Color valor",    type: "color" },
        { key: "label", label: "Color etiqueta", type: "color" },
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

  component: TempGauge,
};
