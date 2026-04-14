/**
 * TableWidget.jsx
 *
 * Widget de tabla de datos históricos para el Historian Dashboard.
 * Autónomo: gestiona su propia query y renderiza HistorianTable.
 *
 * Props:
 *   config     : Widget
 *   isEditing  : bool
 *   onEdit     : () => void
 *   onDelete   : () => void
 */
import React, { useEffect, useCallback, useState } from "react";
import WidgetShell from "./WidgetShell";
import HistorianTable from "../components/HistorianTable";
import { queryHistorian } from "@/services/historianService";
import { resolveTimeRange } from "./timePresets";

export default function TableWidget({ config, isEditing, onEdit, onDelete }) {
  const [rows, setRows] = useState([]);
  const [truncated, setTruncated] = useState(false);
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
      setTruncated(data.truncated ?? false);
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
      type="table"
      loading={loading}
      error={error}
      onRefresh={runQuery}
      isEditing={isEditing}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <HistorianTable rows={rows} truncated={truncated} />
    </WidgetShell>
  );
}
