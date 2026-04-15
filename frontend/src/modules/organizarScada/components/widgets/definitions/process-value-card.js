import ProcessValueCard from "../process/ProcessValueCard";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default {
  type:        "process-value-card",
  label:       "Tarjeta de valor",
  category:    "proceso",
  icon:        "pump",
  defaultSize: { w: 200, h: 120 },

  buildProps({ settings, live, width, height }) {
    const min   = settings.min ?? settings.minValue ?? 0;
    const max   = settings.max ?? settings.maxValue ?? 100;
    const value = parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? null;
    const unit  = live.unit || settings.unit || "";
    const label = settings.attributeLabel || settings.label || "";
    return {
      iconKey: settings.iconKey || "pump",
      label, value, unit, min, max,
      width, height,
    };
  },

  styleSchema: [
    {
      group: "Color",
      fields: [{ key: "primary", label: "Color de acento", type: "color" }],
    },
  ],

  resolveStyle(palette) {
    return { primary: palette.primary || "#3b82f6" };
  },

  component: ProcessValueCard,
};
