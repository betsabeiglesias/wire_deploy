/**
 * historianService.js
 *
 * Llama al edge historian (FastAPI) directamente.
 *
 * Variables de entorno requeridas en .env.local:
 *   VITE_HISTORIAN_URL=http://localhost:8010
 *   VITE_HISTORIAN_API_KEY=historian-secret-change-me   (opcional)
 */


// RETOMAR

const HISTORIAN_BASE = import.meta.env.VITE_HISTORIAN_URL ?? "http://localhost:8010";
const HISTORIAN_API_KEY = import.meta.env.VITE_HISTORIAN_API_KEY ?? "historian-secret-change-me";

// ── Helper ────────────────────────────────────────────────────────────────────

async function _post(path, body) {
  if (!HISTORIAN_BASE) {
    throw new Error("VITE_HISTORIAN_URL no está configurada");
  }

  const headers = { "Content-Type": "application/json" };
  if (HISTORIAN_API_KEY) headers["X-API-Key"] = HISTORIAN_API_KEY;

  const res = await fetch(`${HISTORIAN_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(err.detail || err.error || `HTTP ${res.status}`),
      { response: { data: err } }
    );
  }

  return res.json();
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Filas crudas de telemetría en el rango indicado.
 *
 * @param {{ tags: Array<{equipment_id,variable}>, start: string, stop: string, limit?: number }}
 * @returns {Promise<{ rows: Array, count: number, truncated: boolean }>}
 */
export const queryHistorian = ({ tags, start, stop, limit = 5000 }) =>
  _post("/api/historian/query/", { tags, start, stop, limit });

/**
 * Datos agregados (avg/min/max/sum/count) por ventana temporal.
 *
 * @param {{ tags, start, stop, window_seconds?: number, fn?: string }}
 * @returns {Promise<{ rows: Array, count: number }>}
 */
export const queryAggregate = ({ tags, start, stop, window_seconds = 60, fn = "avg" }) =>
  _post("/api/historian/aggregate/", { tags, start, stop, window_seconds, fn });
