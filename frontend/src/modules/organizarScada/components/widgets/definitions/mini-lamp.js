import MiniLampWidget from "../mini/MiniLampWidget";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "mini-lamp",
  label:       "Lámpara Boolean",
  category:    "minis",
  icon:        "status_ok",
  defaultSize: { w: 80, h: 80 },

  buildProps({ settings, live }) {
    const label  = settings.attributeLabel || settings.label || "";
    const active =
      typeof live.value === "boolean"
        ? live.value
        : Boolean(settings.initialValue ?? false);
    return { active, label };
  },

  styleSchema: [
    {
      group: "Estado",
      fields: [
        { key: "primary",   label: "Color activo",   type: "color" },
        { key: "secondary", label: "Color inactivo", type: "color" },
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

  component: MiniLampWidget,
};
