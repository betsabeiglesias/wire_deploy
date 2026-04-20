/**
 * timePresets.js
 *
 * Utilidad para resolver un rango de tiempo a partir de un preset
 * ("1h", "6h", "24h", "7d") o de valores explícitos start/stop.
 *
 * Usada por los widgets del Historian para no duplicar la lógica
 * de DateRangePicker en cada uno.
 */

export const TIME_PRESETS = [
  { label: "1 h",  value: "1h",  hours: 1   },
  { label: "6 h",  value: "6h",  hours: 6   },
  { label: "24 h", value: "24h", hours: 24  },
  { label: "7 d",  value: "7d",  hours: 168 },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Convierte un string "YYYY-MM-DDTHH:MM" en hora local a ISO UTC para la API.
 * new Date(localStr) lo interpreta como hora local del navegador.
 */
function localToUtcIso(localStr) {
  if (!localStr) return "";
  const d = new Date(localStr);
  return Number.isNaN(d.getTime()) ? localStr : d.toISOString();
}

/**
 * Resuelve el rango de tiempo efectivo para una query.
 * Devuelve siempre strings UTC ISO ("2026-04-20T08:00:00.000Z") para enviar a la API.
 *
 * @param {string|null} preset  - "1h" | "6h" | "24h" | "7d" | null
 * @param {string|null} start   - "YYYY-MM-DDTHH:MM" hora local (usado si preset es null)
 * @param {string|null} stop    - "YYYY-MM-DDTHH:MM" hora local (usado si preset es null)
 * @returns {{ start: string, stop: string }}
 */
export function resolveTimeRange(preset, start, stop) {
  const found = TIME_PRESETS.find((p) => p.value === preset);
  if (found) {
    const now = new Date();
    const from = new Date(now.getTime() - found.hours * 3_600_000);
    return { start: from.toISOString(), stop: now.toISOString() };
  }
  return { start: localToUtcIso(start ?? ""), stop: localToUtcIso(stop ?? "") };
}

/**
 * Devuelve la etiqueta legible del preset o "Personalizado".
 */
export function presetLabel(preset) {
  return TIME_PRESETS.find((p) => p.value === preset)?.label ?? "Personalizado";
}
