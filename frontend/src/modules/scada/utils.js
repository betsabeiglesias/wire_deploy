// frontend/src/modules/scada/utils.js

// BORRAR?
export const parseNumericValue = (raw) => {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const sanitized = raw.replace(",", ".");
    const parsed = Number(sanitized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}; 

export const formatNumericValue = (value) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) return null;
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatValueWithDecimals = (value) => {
  if (typeof value === "boolean") return value ? "True" : "False";
  const formatted = formatNumericValue(value);
  if (formatted !== null) return formatted;
  if (value === null || typeof value === "undefined") return "-";
  return String(value);
};

export const clampPercent = (value) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) return 0;
  return Math.max(0, Math.min(100, numericValue));
};

export const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};
