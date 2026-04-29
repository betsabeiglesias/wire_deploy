// definitions/_shared.js
// Utilidades compartidas entre definiciones de widgets.
// No importar aquí nada de React ni componentes — solo lógica pura.

import {
  parseNumericValue,
  normalizePercent,
} from "@/modules/organizarScada/utils/numbers";

import {
  formatNumericValue,
  formatValueWithDecimals,
} from "@/modules/organizarScada/utils/formatters";

/**
 * Construye las props numéricas estándar para widgets mini.
 * Centraliza la normalización de valor, porcentaje y etiqueta.
 */
export const buildNumericMiniProps = (settings, live) => {
  const min = settings.min ?? settings.minValue ?? 0;
  const max = settings.max ?? settings.maxValue ?? 100;

  const rawValue =
    typeof live.value !== "undefined" ? live.value : settings.initialValue;

  const numericValue   = parseNumericValue(rawValue);
  const fallbackNumeric = numericValue ?? parseNumericValue(settings.initialValue) ?? 0;
  const percent         = normalizePercent(fallbackNumeric, min, max);
  const formattedValue  = formatNumericValue(fallbackNumeric) ?? "-";
  const labelText =
    formattedValue === "-"
      ? "-"
      : live.unit
        ? `${formattedValue} ${live.unit}`
        : formattedValue;

  return {
    percent,
    formattedValue,
    labelText,
    bubbleValue: formatValueWithDecimals(rawValue),
    unit: live.unit,
  };
};

/**
 * Palette por defecto cuando un widget no tiene colores configurados.
 */
export const DEFAULT_PALETTE = {
  primary:   "#3b82f6",
  secondary: "#94a3b8",
  text:      "#ffffff",
  unit:      "#94a3b8",
  label:     "#e2e8f0",
};

/**
 * StyleSchema por defecto — se usa cuando un widget no define el suyo.
 */
export const DEFAULT_STYLE_SCHEMA = [
  {
    group: "General",
    fields: [
      { key: "primary", label: "Color principal", type: "color" },
      { key: "text",    label: "Color texto",     type: "color" },
    ],
  },
];


// Estilos compartidos 
export const buildBaseStyle = (palette = {}) => ({
  // 🔥 BACKGROUND REAL DEL THEME
  bgColor: palette.bg || "#ffffff",

  // 🔥 BORDER DEL THEME
  borderColor: palette.border || "#e5e7eb",

  // 🔥 TEXTOS DEL THEME
  titleColor: palette.text || "#0f172a",
  labelColor: palette.textDim || "#64748b",

  // 🔥 GRID / EJES DEL THEME
  gridColor: palette.border || "#e2e8f0",
  axisColor: palette.textDim || "#94a3b8",

  // 🔥 COLORES PRINCIPALES
  primary: palette.primary || "#3b82f6",
  primaryDark: palette.secondary || "#1d4ed8",

  // 🔥 ESTADOS
  success: palette.success || "#10b981",
  warning: palette.warning || "#f59e0b",
  danger: palette.danger || "#ef4444",
});
