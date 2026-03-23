// historian/components/TimeSeriesChart.jsx
// Gráfico de series temporales usando ApexCharts (react-apexcharts ya instalado).
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6",
];

/**
 * Props:
 *   rows     : Array<{timestamp, equipment_id, variable, value, unit}>
 *   tags     : [{equipment_id, variable}]  — para mantener el orden de series
 */
export default function TimeSeriesChart({ rows = [], tags = [] }) {
  const series = useMemo(() => {
    if (!rows.length || !tags.length) return [];

    // Agrupar por clave
    const grouped = {};
    for (const row of rows) {
      const key = `${row.equipment_id}|${row.variable}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        x: new Date(row.timestamp).getTime(),
        y: row.value !== null && row.value !== undefined ? Number(row.value) : null,
      });
    }

    return tags
      .map((t) => {
        const key = `${t.equipment_id}|${t.variable}`;
        const data = grouped[key];
        if (!data || !data.length) return null;
        return { name: `${t.equipment_id} · ${t.variable}`, data };
      })
      .filter(Boolean);
  }, [rows, tags]);

  const options = useMemo(
    () => ({
      chart: {
        type: "line",
        zoom: { enabled: true, type: "x" },
        toolbar: { show: true, tools: { download: true, zoom: true, reset: true } },
        animations: { enabled: false },
      },
      colors: COLORS,
      stroke: { width: 2, curve: "smooth" },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          style: { fontSize: "11px" },
        },
      },
      yaxis: { labels: { style: { fontSize: "11px" } } },
      tooltip: {
        x: { format: "dd/MM/yyyy HH:mm:ss" },
        shared: true,
        intersect: false,
      },
      legend: { position: "top", fontSize: "12px" },
      grid: { borderColor: "#e2e8f0" },
      noData: { text: "Sin datos para el rango seleccionado" },
    }),
    []
  );

  if (!tags.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Selecciona al menos un tag para visualizar el gráfico.
      </div>
    );
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={320}
    />
  );
}
