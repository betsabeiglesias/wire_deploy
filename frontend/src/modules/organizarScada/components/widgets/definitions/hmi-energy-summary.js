import HmiEnergySummaryCard from "../standard/HmiEnergySummaryCard";

export default {
  type:        "hmi-energy-summary",
  label:       "Resumen de Energia",
  category:    "tarjetas",
  icon:        "card",
  defaultSize: { w: 380, h: 140 },

  buildProps({ settings, width, height }) {
    return {
      title: settings.title || "Resumen",
      value: settings.value,
      unit: settings.unit,
      subtitle: settings.subtitle,
      deltaText: settings.deltaText,
      deltaValue: settings.deltaValue,
      deltaDirection: settings.deltaDirection,
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle() {
    return {};
  },

  component: HmiEnergySummaryCard,
};
