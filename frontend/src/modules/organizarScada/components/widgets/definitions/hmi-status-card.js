import HmiStatusCard from "../standard/HmiStatusCard";

export default {
  type:        "hmi-status-card",
  label:       "Tarjeta de Estado",
  category:    "tarjetas",
  icon:        "status_ok",
  defaultSize: { w: 280, h: 90 },

  buildProps({ settings, width, height }) {
    return {
      status: settings.status || "ok",
      title: settings.title || settings.label || "SISTEMA OK",
      subtitle: settings.subtitle || "",
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle() {
    return {};
  },

  component: HmiStatusCard,
};
