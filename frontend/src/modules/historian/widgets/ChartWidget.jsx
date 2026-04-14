/**
 * ChartWidget.jsx
 *
 * Widget de gráfico de series temporales para el Historian Dashboard.
 * Es autónomo: gestiona su propia query al historian y renderiza
 * TimeSeriesChart con los datos obtenidos.
 *
 * Props:
 *   config     : Widget (shape definido en dashboardService.js)
 *   isEditing  : bool
 *   onEdit     : () => void
 *   onDelete   : () => void
 */
import React, { useEffect, useCallback, useState } from "react";
import WidgetShell from "./WidgetShell";
import TimeSeriesChart from "../components/TimeSeriesChart";
import { queryHistorian } from "@/services/historianService";
import { resolveTimeRange } from "./timePresets";

export default function ChartWidget({ config, isEditing, onEdit, onDelete }) {
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

  return (
    <WidgetShell
      title={config.title}
      type="chart"
      loading={loading}
      error={error}
      onRefresh={runQuery}
      isEditing={isEditing}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <TimeSeriesChart rows={rows} tags={config.tags ?? []} />
    </WidgetShell>
  );
}
