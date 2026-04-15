// historian/components/HistorianTable.jsx
// Tabla paginada con exportacion a CSV y ordenación por columna.
import React, { useMemo, useState } from "react";
import { getVariableDisplayName } from "../utils/tagPresentation";

const PAGE_SIZE = 100;

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatLocalTimestamp(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return String(timestamp).replace("T", " ").replace("Z", "").slice(0, 19);
  }
  return TIMESTAMP_FORMATTER.format(date).replace(",", " -");
}

function exportCSV(rows) {
  const headers = ["timestamp", "equipment_id", "variable", "value", "datatype", "unit", "quality"];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const text = String(value);
          return text.includes(",") || text.includes('"')
            ? `"${text.replace(/"/g, '""')}"`
            : text;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historian_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const COLUMNS = [
  { label: "Timestamp", key: "timestamp" },
  { label: "Variable",  key: "variable"  },
  { label: "Valor",     key: "value"     },
  { label: "Tipo",      key: "datatype"  },
  { label: "Unidad",    key: "unit"      },
  { label: "Calidad",   key: "quality"   },
];

function SortIcon({ active, dir }) {
  if (!active) {
    return <span className="ml-1 text-slate-300 text-[10px]">⇅</span>;
  }
  return (
    <span className="ml-1 text-[#29468b] text-[10px]">
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

/**
 * Props:
 *   rows      : Array<{timestamp, equipment_id, variable, value, datatype, unit, quality}>
 */
export default function HistorianTable({ rows = [] }) {
  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortedRows = useMemo(() => {
    if (!rows.length) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (sortKey === "value") {
        const an = Number(av);
        const bn = Number(bv);
        if (!Number.isNaN(an) && !Number.isNaN(bn)) {
          return sortDir === "asc" ? an - bn : bn - an;
        }
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = useMemo(
    () => sortedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sortedRows, safePage]
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-500">
          {rows.length.toLocaleString()} filas
        </div>
        <button
          type="button"
          onClick={() => exportCSV(rows)}
          className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {COLUMNS.map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-3 py-2 text-center font-semibold text-slate-600 whitespace-nowrap cursor-pointer select-none hover:bg-slate-200 transition-colors"
                >
                  {label}
                  <SortIcon active={sortKey === key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50 hover:bg-slate-100"}
              >
                <td className="px-3 py-1.5 font-mono text-slate-600 whitespace-nowrap">
                  {formatLocalTimestamp(row.timestamp)}
                </td>
                <td
                  className="px-3 py-1.5 font-medium text-slate-800"
                  title={[row.equipment_id, row.variable].filter(Boolean).join(" · ")}
                >
                  {getVariableDisplayName(row.variable)}
                </td>
                <td className="px-3 py-1.5 font-mono text-right">
                  {row.value !== null && row.value !== undefined ? String(row.value) : "-"}
                </td>
                <td className="px-3 py-1.5 text-slate-500">{row.datatype || "-"}</td>
                <td className="px-3 py-1.5 text-slate-500">{row.unit || "-"}</td>
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
                    {row.quality || "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Pagina {safePage} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
