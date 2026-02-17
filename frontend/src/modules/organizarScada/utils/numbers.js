export const parseNumericValue = (raw) => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const sanitized = raw.replace(",", ".");
    const parsed = Number(sanitized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

export const normalizePercent = (value, min = 0, max = 100) => {
  const numericValue = parseNumericValue(value);
  if (numericValue === null) {
    return 0;
  }
  if (min === max) {
    return 100;
  }
  const percent = ((numericValue - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, percent));
};
