/**
 * HistorianPage.jsx  — Modo query manual
 *
 * Layout industrial compacto:
 *   Top bar  →  Chrome compartido (HistorianChrome)
 *   Left rail →  navegación al módulo Dashboards
 *   Contenido →  KPIs (4 col) | panel de query (260 px) | chart + tabla
 */
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

import HistorianLayout from "../components/HistorianChrome";
import TagMultiSelect from "../components/TagMultiSelect";
import DateRangePicker from "../components/DateRangePicker";
import TimeSeriesChart from "../components/TimeSeriesChart";
import HistorianTable from "../components/HistorianTable";
import { queryHistorian } from "@/services/historianService";

/* ── Utilidades ───────────────────────────────────────────────────────────── */
function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 3_600_000);

/* ── KPI tarjeta compacta ─────────────────────────────────────────────────── */
function HistKpi({ title, value, accent }) {
  return (
    <div className="rounded-[6px] border border-[#d6d9e2] bg-[#fbfbfc] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500">
        {title}
      </div>
      <div
        className={[
          "mt-1 text-[20px] font-semibold",
          accent === "error"
            ? "text-red-600"
            : accent === "loading"
            ? "text-amber-500"
            : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Página ───────────────────────────────────────────────────────────────── */
export default function HistorianPage() {
  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState([]);
  const [start, setStart] = useState(() => toLocalInput(yesterday));
  const [stop, setStop] = useState(() => toLocalInput(now));
  const [limit, setLimit] = useState(5000);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canQuery = selectedTags.length > 0 && start && stop;

  const handleQuery = useCallback(async () => {
    if (!canQuery) return;
    setLoading(true);
    setError(null);
    try {
      const data = await queryHistorian({ tags: selectedTags, start, stop, limit });
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

  /* ── Slot derecho del top bar: acceso a Dashboards ── */
  const rightSlot = (
    <button
      onClick={() => navigate("/historian/dashboards")}
      className="flex items-center gap-1.5 rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
    >
      <LayoutGrid className="h-3.5 w-3.5" />
      Dashboards
    </button>
  );

  return (
    <HistorianLayout subtitle="Consulta manual" rightSlot={rightSlot}>
      <div className="flex h-full flex-col gap-2 p-2">

        {/* ── KPIs ── */}
        <div className="grid shrink-0 grid-cols-4 gap-2">
          <HistKpi title="Tags seleccionados" value={selectedTags.length} />
          <HistKpi
            title="Registros"
            value={result?.rows?.length?.toLocaleString() ?? "—"}
          />
          <HistKpi
            title="Rango"
            value={
              start && stop
                ? `${start.slice(11, 16)} → ${stop.slice(11, 16)}`
                : "—"
            }
          />
          <HistKpi
            title="Estado"
            value={loading ? "Consultando" : error ? "Error" : result ? "OK" : "—"}
            accent={loading ? "loading" : error ? "error" : undefined}
          />
        </div>

        {/* ── Área principal: query panel (derecha) + chart/tabla (izquierda) ── */}
        <div className="flex min-h-0 flex-1 gap-2">

          {/* ── Izquierda: gráfico + tabla ── */}
          <div className="flex min-h-0 flex-1 flex-col gap-2">

            {/* Gráfico */}
            <div
              className="shrink-0 rounded-[4px] border border-slate-300 bg-[#f9f9fa] p-2"
              style={{ height: 310 }}
            >
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Series temporales
              </div>
              <TimeSeriesChart rows={result?.rows ?? []} tags={selectedTags} />
            </div>

            {/* Tabla */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[4px] border border-slate-300 bg-white p-2">
              <div className="mb-1 shrink-0 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Datos históricos
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <HistorianTable
                  rows={result?.rows ?? []}
                  truncated={result?.truncated ?? false}
                />
              </div>
            </div>
          </div>

          {/* ── Derecha: parámetros de consulta ── */}
          <div
            className="flex shrink-0 flex-col gap-3 overflow-y-auto rounded-[4px] border border-slate-300 bg-[#f9f9fa] p-3"
            style={{ width: 268 }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Parámetros de consulta
            </div>

            {/* Tags */}
            <div>
              <div className="mb-1 text-[10px] text-slate-400 uppercase">Tags</div>
              <TagMultiSelect selected={selectedTags} onChange={setSelectedTags} />
            </div>

            {/* Rango de tiempo */}
            <div>
              <div className="mb-1 text-[10px] text-slate-400 uppercase">Rango de tiempo</div>
              <DateRangePicker
                start={start}
                stop={stop}
                onStart={setStart}
                onStop={setStop}
              />
            </div>

            {/* Límite */}
            <div>
              <div className="mb-1 text-[10px] text-slate-400 uppercase">Límite de registros</div>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full rounded-[4px] border border-slate-300 px-2 py-1.5 text-[12px] focus:border-[#29468b] focus:outline-none"
              >
                {[1000, 5000, 10000, 25000, 50000].map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()} registros
                  </option>
                ))}
              </select>
            </div>

            {/* Botón consultar */}
            <button
              disabled={!canQuery || loading}
              onClick={handleQuery}
              className="w-full rounded-[4px] bg-[#29468b] py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#3558a8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Consultando…" : "Consultar"}
            </button>

            {/* Error */}
            {error && (
              <div className="rounded-[4px] border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                {error}
              </div>
            )}

            {/* Resultado truncado */}
            {result?.truncated && (
              <div className="rounded-[4px] border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-700">
                Resultado truncado — ajusta el rango o el límite.
              </div>
            )}

            {/* Separador hacia Dashboards */}
            <div className="mt-auto border-t border-slate-200 pt-3">
              <div className="mb-2 text-[10px] text-slate-400 uppercase">Modo visualización</div>
              <button
                onClick={() => navigate("/historian/dashboards")}
                className="flex w-full items-center justify-between rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600 hover:border-[#29468b] hover:text-[#29468b] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Gestionar dashboards
                </span>
                <span className="text-slate-300">→</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </HistorianLayout>
  );
}
