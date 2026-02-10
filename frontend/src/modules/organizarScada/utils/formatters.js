import { parseNumericValue } from "./numbers";

export const formatNumericValue = (value) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) {
    return null;
  }
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatValueWithDecimals = (value) => {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  const formatted = formatNumericValue(value);
  if (formatted !== null) {
    return formatted;
  }
  if (value === null || typeof value === "undefined") {
    return "-";
  }
  return String(value);
};
