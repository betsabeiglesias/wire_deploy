export function getVariableDisplayName(variable) {
  const raw = String(variable ?? "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || raw;
}

export function getTagDisplayName(tag) {
  return getVariableDisplayName(tag?.variable);
}

export function getTagFullLabel(tag) {
  return [tag?.equipment_id, tag?.variable].filter(Boolean).join(" · ");
}

export function getTagSearchText(tag) {
  return [
    tag?.equipment_id,
    tag?.variable,
    getTagDisplayName(tag),
    tag?.unit,
    tag?.datatype,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
