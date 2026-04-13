/**
 * dashboardService.js
 *
 * CRUD de dashboards de Historian sobre localStorage.
 * La API es asíncrona (devuelve Promises) para facilitar
 * la migración futura a un endpoint Django sin cambiar
 * el código de los consumidores.
 *
 * Forma del objeto Dashboard:
 * {
 *   id          : string (uuid)
 *   title       : string
 *   description : string
 *   created_at  : ISO string
 *   updated_at  : ISO string
 *   widgets     : Widget[]
 * }
 *
 * Forma del objeto Widget:
 * {
 *   id          : string (uuid)
 *   type        : "chart" | "table" | "kpi"
 *   title       : string
 *   tags        : [{equipment_id, variable}]
 *   timePreset  : "1h" | "6h" | "24h" | "7d" | null
 *   start       : string | null   (usado solo si timePreset === null)
 *   stop        : string | null
 *   limit       : number
 *   colSpan     : 1 | 2           (columnas del grid: mitad | completo)
 * }
 */

const STORAGE_KEY = "historian_dashboards";

function _load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function _save(dashboards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

/** Devuelve todos los dashboards ordenados por fecha de modificación descendente. */
export function listDashboards() {
  const all = _load();
  return Promise.resolve(
    [...all].sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1))
  );
}

/** Devuelve un dashboard por ID. Rechaza si no existe. */
export function getDashboard(id) {
  const found = _load().find((d) => d.id === id);
  if (!found) return Promise.reject(new Error(`Dashboard "${id}" no encontrado`));
  return Promise.resolve(found);
}

/** Crea un nuevo dashboard con widgets vacíos. */
export function createDashboard({ title, description = "" }) {
  const all = _load();
  const now = new Date().toISOString();
  const dashboard = {
    id: crypto.randomUUID(),
    title: title || "Nuevo dashboard",
    description,
    created_at: now,
    updated_at: now,
    widgets: [],
  };
  _save([...all, dashboard]);
  return Promise.resolve(dashboard);
}

/** Actualiza campos de un dashboard existente. */
export function updateDashboard(id, patch) {
  const all = _load();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return Promise.reject(new Error(`Dashboard "${id}" no encontrado`));
  const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  const next = [...all];
  next[idx] = updated;
  _save(next);
  return Promise.resolve(updated);
}

/** Elimina un dashboard por ID. */
export function deleteDashboard(id) {
  _save(_load().filter((d) => d.id !== id));
  return Promise.resolve();
}
