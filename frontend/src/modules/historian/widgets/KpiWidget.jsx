/**
 * KpiWidget.jsx
 *
 * Widget de KPI para el Historian Dashboard.
 * Muestra el último valor, unidad y estadísticas básicas (avg / min / max)
 * para cada tag seleccionado en el rango de tiempo configurado.
 *
 * Props:
 *   config     : Widget
 *   isEditing  : bool
 *   onEdit     : () => void
 *   onDelete   : () => void
 */
import React, { useEffect, useCallback, useState, useMemo } from "react";
import WidgetShell from "./WidgetShell";
import { queryHistorian } from "@/services/historianService";
import { resolveTimeRange } from "./timePresets";

/** Calcula estadísticas básicas a partir de un array de filas para un tag dado. */
function computeStats(rows, equipment_id, variable) {
  const values = rows
    .filter(
      (r) =>
        r.equipment_id === equipment_id &&
        r.variable === variable &&
        r.value !== null &&
        r.value !== undefined
    )
    .map((r) => Number(r.value))
    .filter((v) => !isNaN(v));

  if (!values.length) return null;

  const last = values[values.length - 1];
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    last: last.toLocaleString("es-ES", { maximumFractionDigits: 3 }),
    avg: avg.toLocaleString("es-ES", { maximumFractionDigits: 3 }),
    min: min.toLocaleString("es-ES", { maximumFractionDigits: 3 }),
    max: max.toLocaleString("es-ES", { maximumFractionDigits: 3 }),
    count: values.length,
  };
}

function KpiCard({ tag, stats, unit }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[110px]">
        <span className="text-xs text-slate-400 truncate max-w-full">{tag.variable}</span>
        <span className="text-sm text-slate-300 mt-1">Sin datos</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100">
      {/* Variable */}
      <span
        className="text-[11px] font-medium text-slate-500 truncate mb-1"
        title={`${tag.equipment_id} · ${tag.variable}`}
      >
        {tag.variable}
      </span>

      {/* Valor principal */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-3xl font-semibold tracking-tight text-slate-800 tabular-nums">
          {stats.last}
        </span>
        {unit && (
          <span className="text-sm text-slate-400 font-medium">{unit}</span>
        )}
      </div>

      {/* Stats secundarios */}
      <div className="flex gap-3 mt-3 text-[10px] text-slate-400">
        <span title="Promedio">
          avg <span className="font-semibold text-slate-600">{stats.avg}</span>
        </span>
        <span title="Mínimo">
          min <span className="font-semibold text-slate-600">{stats.min}</span>
        </span>
        <span title="Máximo">
          max <span className="font-semibold text-slate-600">{stats.max}</span>
        </span>
        <span className="ml-auto" title="Registros">
          {stats.count.toLocaleString()} reg
        </span>
      </div>
    </div>
  );
}

export default function KpiWidget({ config, isEditing, onEdit, onDelete }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runQuery = useCallback(async () => {
    if (!config.tags?.length) return;
    const { start, stop } = resolveTimeRange(config.timePreset, config.start, config.stop);
    if (!start || !stop) return;

    setLoading(true);
    setError(null);
    try {
      const data = await queryHistorian({
        tags: config.tags,
        start,
        stop,
        limit: config.limit ?? 5000,
      });
      setRows(data.rows ?? []);
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
  }, [config]);

  useEffect(() => {
    runQuery();
  }, [runQuery]);

  const tagStats = useMemo(
    () =>
      (config.tags ?? []).map((tag) => ({
        tag,
        stats: computeStats(rows, tag.equipment_id, tag.variable),
      })),
    [rows, config.tags]
  );

  const cols =
    tagStats.length === 1
      ? "grid-cols-1"
      : tagStats.length === 2
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-3";

  return (
    <WidgetShell
      title={config.title}
      type="kpi"
      loading={loading}
      error={error}
      onRefresh={runQuery}
      isEditing={isEditing}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      {tagStats.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-sm text-slate-400">
          Configura al menos un tag.
        </div>
      ) : (
        <div className={`grid ${cols} gap-3`}>
          {tagStats.map(({ tag, stats }) => (
            <KpiCard
              key={`${tag.equipment_id}|${tag.variable}`}
              tag={tag}
              stats={stats}
              unit={null}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
