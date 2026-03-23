// historian/pages/HistorianPage.jsx
import React, { useState, useCallback } from "react";
import HomeButton from "@/components/HomeButton";
import TagMultiSelect from "../components/TagMultiSelect";
import DateRangePicker from "../components/DateRangePicker";
import TimeSeriesChart from "../components/TimeSeriesChart";
import HistorianTable from "../components/HistorianTable";
import { queryHistorian } from "@/services/historianService";

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 3_600_000);

export default function HistorianPage() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [start, setStart] = useState(() => toLocalInput(yesterday));
  const [stop, setStop] = useState(() => toLocalInput(now));
  const [limit, setLimit] = useState(5000);

  const [result, setResult] = useState(null);   // {rows, count, truncated}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canQuery = selectedTags.length > 0 && start && stop;

  const handleQuery = useCallback(async () => {
    if (!canQuery) return;
    setLoading(true);
    setError(null);
    console.log("selectedTags:", JSON.stringify(selectedTags));
    try {
      const data = await queryHistorian({
        tags: selectedTags,
        start,
        stop,
        limit,
      });
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Error al consultar el Historian"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedTags, start, stop, limit, canQuery]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Historian</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Consulta datos históricos de telemetría desde SQL Server
            </p>
          </div>
          <HomeButton />
        </header>

        {/* Panel de filtros */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
            Parámetros de consulta
          </h2>

          {/* Tag selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Tags
            </label>
            <TagMultiSelect selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {/* Rango de fechas + límite + botón */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Rango de tiempo
              </label>
              <DateRangePicker
                start={start}
                stop={stop}
                onStart={setStart}
                onStop={setStop}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Límite de filas
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded px-2 py-1.5 focus:border-sky-400 focus:outline-none"
              >
                {[1000, 5000, 10000, 25000, 50000].map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!canQuery || loading}
              onClick={handleQuery}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Consultando…" : "Consultar"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* Aviso de selección */}
          {!canQuery && selectedTags.length === 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Selecciona al menos un tag para habilitar la consulta.
            </p>
          )}
        </section>

        {/* Gráfico */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Gráfico de series temporales
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">
              Cargando datos…
            </div>
          ) : (
            <TimeSeriesChart rows={result?.rows ?? []} tags={selectedTags} />
          )}
        </section>

        {/* Tabla */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Datos
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-24 text-sm text-slate-400">
              Cargando datos…
            </div>
          ) : (
            <HistorianTable rows={result?.rows ?? []} truncated={result?.truncated ?? false} />
          )}
        </section>
      </main>
    </div>
  );
}
