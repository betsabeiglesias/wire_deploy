/**
 * dashboardService.js
 *
 * CRUD de dashboards de Historian sobre la API Django.
 * La API es asíncrona (devuelve Promises).
 *
 * Forma del objeto Dashboard (tal como devuelve el backend):
 * {
 *   id          : string (uuid)
 *   title       : string
 *   description : string
 *   widgets     : Widget[]
 *   created_at  : ISO string
 *   updated_at  : ISO string
 * }
 *
 * Forma del objeto Widget (almacenado en el JSONField widgets del dashboard):
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

import api from '@/services/api';

const BASE = '/api/historian/dashboards/';

/** Devuelve todos los dashboards del usuario (ordenados por updated_at desc en el backend). */
export function listDashboards() {
  return api.get(BASE).then((r) => r.data);
}

/** Devuelve un dashboard por ID. Rechaza si no existe o no pertenece al usuario. */
export function getDashboard(id) {
  return api.get(`${BASE}${id}/`).then((r) => r.data);
}

/** Crea un nuevo dashboard. Acepta { title, description?, widgets? }. */
export function createDashboard({ title, description = '', widgets = [] }) {
  return api.post(BASE, { title, description, widgets }).then((r) => r.data);
}

/** Reemplaza un dashboard existente por completo. */
export function updateDashboard(id, patch) {
  return api.put(`${BASE}${id}/`, patch).then((r) => r.data);
}

/** Elimina un dashboard por ID. */
export function deleteDashboard(id) {
  return api.delete(`${BASE}${id}/`).then(() => undefined);
}
