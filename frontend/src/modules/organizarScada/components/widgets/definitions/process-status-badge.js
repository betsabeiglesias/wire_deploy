import ProcessStatusBadge from "../process/ProcessStatusBadge";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "process-status-badge",
  label:       "Estado de equipo",
  category:    "proceso",
  icon:        "motor",
  defaultSize: { w: 160, h: 130 },

  buildProps({ settings, live, width, height }) {
    const value = live.value !== undefined ? live.value : settings.initialValue ?? null;
    const label = settings.attributeLabel || settings.label || "";
    return {
      iconKey: settings.iconKey || "motor",
      label, value,
      width, height,
    };
  },

  styleSchema: [
    {
      group: "Color",
      fields: [{ key: "primary", label: "Color icono", type: "color" }],
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

  component: ProcessStatusBadge,
};
