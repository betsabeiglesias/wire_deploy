import MiniTable from "../mini/MiniTable";

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

  resolveStyle() {
    return {};
  },

  component: MiniTable,
};
