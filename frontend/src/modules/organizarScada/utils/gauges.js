// Asegúrate de importar tus iconos al principio del archivo
// import { genericGaugeIcon, gaugeDefaultIcon, ... } from './tus-iconos';
import genericGaugeIcon from "@/assets/icons/gauge.svg";
import gaugeDefaultIcon from "@/assets/icons/gaugeDefault.svg";
import gaugeMiniHorizontalIcon from "@/assets/icons/gaugeMiniHorizontal.svg";
import gaugeMiniDonutIcon from "@/assets/icons/gaugeMiniDonut.svg";
import gaugeMiniNeedleIcon from "@/assets/icons/gaugeMiniNeedle.svg";
import gaugeAlertaIcon from "@/assets/icons/gaugeAlerta.svg";
import gaugeAguhaIcon from "@/assets/icons/gaugeAguha.svg";
import tarjtaIcon from "@/assets/icons/tarjeta.svg";
import tarjeta2Icon from "@/assets/icons/tarjeta2.svg";
import gaugeSemiIcon from '@/assets/icons/gaugeSemi.svg'
import gaugeAnilloIcon from '@/assets/icons/gaugeAnillo.svg'
import gaugeNeedleIcon from '@/assets/icons/gaugeNeedle.svg'
import gaugeMiniRingIcon from '@/assets/icons/gaugeMiniRing.svg'

export const templates = [
  {
    id: "tpl-temperature-gauge",
    title: "Indicador de Temperatura",
    thumbnailUrl: genericGaugeIcon,
    data: {
      type: "temperature-gauge",
      width: 220,
      height: 250,
      label: "Temp. (C)",
    },
  },
  {
    id: "tpl-gauge-1",
    title: "Gauge",
    thumbnailUrl: gaugeDefaultIcon,
    data: {
      type: "svg-gauge",
      width: 220,
      height: 250,
      label: "Gauge",
      className: "",
      gaugeOptions: {
        id: "g1",
        max: 100,
        dialStartAngle: -90,
        dialEndAngle: -90.001,
        value: 0,
      },
    },
  },
  {
    id: "tpl-gauge-semi",
    title: "Gauge Semicircular",
    thumbnailUrl: gaugeSemiIcon,
    data: {
      type: "svg-gauge",
      width: 220,
      height: 250,
      label: "Semi",
      className: "five",
      gaugeOptions: {
        id: "g-semi",
        max: 100,
        dialStartAngle: 180,
        dialEndAngle: 0,
        value: 0,
      },
    },
  },
  {
    id: "tpl-gauge-ring",
    title: "Gauge Anillo",
    thumbnailUrl: gaugeAnilloIcon,
    data: {
      type: "svg-gauge",
      width: 220,
      height: 250,
      label: "Ring",
      className: "three",
      gaugeOptions: {
        id: "g-ring",
        max: 100,
        dialStartAngle: -90,
        dialEndAngle: -90.001,
        value: 0,
      },
    },
  },
  {
    id: "tpl-gauge-threshold",
    title: "Gauge con Umbrales",
    thumbnailUrl: gaugeNeedleIcon,
    data: {
      type: "svg-gauge",
      width: 220,
      height: 250,
      label: "Umbrales",
      className: "two",
      gaugeOptions: {
        id: "g-th",
        min: -50,
        max: 50,
        dialStartAngle: 180,
        dialEndAngle: 0,
        value: 0,
        color: (val) => val, // Las funciones solo funcionan en JS, no en JSON puro
      },
    },
  },
  {
    id: "tpl-mini-ring",
    title: "Mini Ring Gauge",
    thumbnailUrl: gaugeMiniRingIcon,
    data: {
      type: "mini-ring",
      width: 200,
      height: 220,
      label: "Temp",
      settings: { minValue: 0, maxValue: 100 },
    },
  },
  {
    id: "tpl-mini-horizontal",
    title: "Mini Barra Horizontal",
    thumbnailUrl: gaugeMiniHorizontalIcon,
    data: {
      type: "mini-horizontal",
      width: 260,
      height: 180,
      label: "Proceso",
      settings: { minValue: 0, maxValue: 100 },
    },
  },
  {
    id: "tpl-mini-donut",
    title: "Mini Donut",
    thumbnailUrl: gaugeMiniDonutIcon,
    data: {
      type: "mini-donut",
      width: 220,
      height: 220,
      label: "Grados",
      settings: { minValue: 0, maxValue: 360 },
    },
  },
  {
    id: "tpl-mini-bubble",
    title: "Burbuja Valor",
    thumbnailUrl: gaugeMiniNeedleIcon,
    data: {
      type: "mini-bubble",
      width: 180,
      height: 200,
      label: "Lectura",
      settings: {},
    },
  },
  {
    id: "tpl-mini-lamp",
    title: "Indicador OK/Fallo",
    thumbnailUrl: gaugeAlertaIcon,
    data: {
      type: "mini-lamp",
      width: 180,
      height: 200,
      label: "Estado",
      settings: { initialValue: false },
    },
  },
  {
    id: "tpl-mini-needle",
    title: "Gauge Aguja",
    thumbnailUrl: gaugeAguhaIcon,
    data: {
      type: "mini-needle",
      width: 220,
      height: 220,
      label: "Needle",
    },
  },
  {
    id: "tpl-power-card",
    title: "Tarjeta Power",
    thumbnailUrl: tarjtaIcon,
    data: {
      type: "power-card",
      width: 260,
      height: 140,
      label: "Power",
    },
  },
  {
    id: "tpl-press-card",
    title: "Tarjeta Press",
    thumbnailUrl: tarjeta2Icon,
    data: {
      type: "press-card",
      width: 240,
      height: 150,
      label: "Press",
    },
  },
  {
    id: "tpl-mini-table",
    title: "Tabla Datos",
    thumbnailUrl: genericGaugeIcon,
    data: {
      type: "mini-table",
      width: 380,
      height: 240,
      label: "Tabla Datos",
      settings: {},
    },
  },
  {
    id: "tpl-mini-chart",
    title: "Mini Grafico",
    thumbnailUrl: genericGaugeIcon,
    data: {
      type: "mini-chart",
      width: 360,
      height: 220,
      label: "Grafico",
      settings: {},
    },
  },
];