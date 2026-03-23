// historian/components/HistorianTable.jsx
// Tabla paginada con exportación a CSV.
import React, { useMemo, useState } from "react";

const PAGE_SIZE = 100;

function exportCSV(rows) {
  const headers = ["timestamp", "equipment_id", "variable", "value", "datatype", "unit", "quality"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h] ?? "";
        // Escapar comas y comillas en strings
        const s = String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historian_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Props:
 *   rows      : Array<{timestamp, equipment_id, variable, value, datatype, unit, quality}>
 *   truncated : bool
 */
export default function HistorianTable({ rows = [], truncated = false }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage]
  );

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-slate-400">
        Sin datos. Lanza una consulta para ver resultados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Barra superior */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-500">
          {rows.length.toLocaleString()} filas
          {truncated && (
            <span className="ml-2 text-amber-600 font-medium">
              (resultado truncado — ajusta el rango o el límite)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => exportCSV(rows)}
          className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {["Timestamp", "Equipment ID", "Variable", "Valor", "Tipo", "Unidad", "Calidad"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50 hover:bg-slate-100"}
              >
                <td className="px-3 py-1.5 font-mono text-slate-600 whitespace-nowrap">
                  {row.timestamp?.replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-3 py-1.5 text-slate-700 max-w-[160px] truncate" title={row.equipment_id}>
                  {row.equipment_id}
                </td>
                <td className="px-3 py-1.5 font-medium text-slate-800">{row.variable}</td>
                <td className="px-3 py-1.5 font-mono text-right">
                  {row.value !== null && row.value !== undefined ? String(row.value) : "—"}
                </td>
                <td className="px-3 py-1.5 text-slate-500">{row.datatype || "—"}</td>
                <td className="px-3 py-1.5 text-slate-500">{row.unit || "—"}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={[
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      row.quality === "good"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.quality === "bad"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    {row.quality || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Página {safePage} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              ‹ Anterior
            </button>
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              Siguiente ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
