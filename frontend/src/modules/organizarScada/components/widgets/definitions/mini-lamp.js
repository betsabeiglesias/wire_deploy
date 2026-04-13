import MiniLampWidget from "../mini/MiniLampWidget";

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

  resolveStyle(palette) {
    return {
      activeColor:   palette.primary   || "#22c55e",
      inactiveColor: palette.secondary || "#334155",
    };
  },

  component: MiniLampWidget,
};
