import HmiStatusCard from "../standard/HmiStatusCard";
import { buildBaseStyle } from "./_shared";

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

  component: HmiStatusCard,
};
