import { ICON_MAP } from "./iconMap";

export function resolveIcon({
  icon,
  type,          // 👈 AÑADIR ESTO
  variableType,
  unit,
  label,
}) {
  // 1. prioridad manual
  if (icon && ICON_MAP[icon]) {
    return icon;
  }

  // 2. POR TIPO DE WIDGET
  if (type) {
    if (type.includes("temp")) return "temperature";
    if (type.includes("tank")) return "tank";
    if (type.includes("pressure")) return "pressure";
    if (type.includes("flow")) return "flow";
    if (type.includes("valve")) return "valve";

    if (type.includes("bar")) return "chartBar";
    if (type.includes("chart")) return "chart";
    if (type.includes("trend")) return "chart";

    if (type.includes("status")) return "status_ok";
    if (type.includes("card")) return "card";
  }

  // 3. por tipo de variable
  if (variableType) {
    switch (variableType) {
      case "temperature": return "temperature";
      case "pressure":    return "pressure";
      case "flow":        return "flow";
      case "level":       return "tank";
      case "valve":       return "valve";
    }
  }

  // 4. por unidad (SCADA real)
  if (unit) {
    const u = unit.toLowerCase();

    if (u.includes("°") || u.includes("c") || u.includes("k")) return "temperature";
    if (u.includes("bar") || u.includes("psi") || u.includes("pa")) return "pressure";
    if (u.includes("m3") || u.includes("m³") || u.includes("l/")) return "flow";
    if (u.includes("%")) return "gauge";
  }

  // 5. fallback
  return "gauge";
}