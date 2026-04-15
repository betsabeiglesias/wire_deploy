import ProcessLevelCard from "../process/ProcessLevelCard";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default {
  type:        "process-level-card",
  label:       "Nivel de depósito",
  category:    "proceso",
  icon:        "tank",
  defaultSize: { w: 160, h: 200 },

  buildProps({ settings, live, width, height }) {
    const min   = settings.min ?? settings.minValue ?? 0;
    const max   = settings.max ?? settings.maxValue ?? 100;
    const value = parseNumericValue(live.value) ?? parseNumericValue(settings.initialValue) ?? null;
    const unit  = live.unit || settings.unit || "%";
    const label = settings.attributeLabel || settings.label || "";
    return {
      iconKey: settings.iconKey || "tank",
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

  component: ProcessLevelCard,
};
