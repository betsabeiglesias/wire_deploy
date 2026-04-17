import MiniTable from "../mini/MiniTable";
import { buildBaseStyle } from "./_shared";

export default {
  type:        "mini-table",
  label:       "Mini Tabla",
  category:    "minis",
  icon:        "table",
  defaultSize: { w: 220, h: 160 },

  buildProps({ settings }) {
    return {
      rows: settings.rows || [],
    };
  },

  styleSchema: [],

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
  component: MiniTable,
};
