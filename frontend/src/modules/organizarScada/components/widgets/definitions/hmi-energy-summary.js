import HmiEnergySummaryCard from "../cards/HmiEnergySummaryCard";
import { buildBaseStyle } from "./_shared";

export default {
  type: "hmi-energy-summary",
  label: "Resumen de Energia",
  category: "tarjetas",
  icon: "card",
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

  resolveStyle(palette = {}) {
    const base = buildBaseStyle(palette);

    return {
      backgroundColor: base.bgColor,
      textColor: base.titleColor,
      primaryColor: base.primary,
      secondaryColor: base.primaryDark,
    };
  },

  component: HmiEnergySummaryCard,
};