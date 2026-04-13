/**
 * WidgetShell.jsx
 *
 * Wrapper visual industrial para todos los widgets del Historian Dashboard.
 * Estética: rounded-[4px], bg-[#f9f9fa], border border-slate-300, textos 10-12px.
 *
 * Props:
 *   title      : string
 *   type       : "chart" | "table" | "kpi"
 *   loading    : bool
 *   error      : string | null
 *   onRefresh  : () => void
 *   isEditing  : bool
 *   onEdit     : () => void
 *   onDelete   : () => void
 *   children   : ReactNode
 */
import { RefreshCw, Settings2, Trash2, BarChart2, Table2, Activity } from "lucide-react";

const TYPE_ICONS = {
  chart: BarChart2,
  table: Table2,
  kpi:   Activity,
};

const TYPE_LABELS = {
  chart: "Gráfico",
  table: "Tabla",
  kpi:   "KPI",
};

export default function WidgetShell({
  title,
  type,
  loading,
  error,
  onRefresh,
  isEditing,
  onEdit,
  onDelete,
  children,
}) {
  const TypeIcon = TYPE_ICONS[type] ?? BarChart2;

  return (
    <div className="flex flex-col overflow-hidden rounded-[4px] border border-slate-300 bg-[#f9f9fa] h-full">
      {/* ── Cabecera compacta ── */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200 bg-[#eef2f8] px-2 py-1.5">
        <TypeIcon className="h-3 w-3 shrink-0 text-slate-400" />

        <span className="flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          {title || "Widget"}
        </span>

        {/* Badge tipo */}
        <span className="hidden shrink-0 text-[9px] font-medium text-slate-400 sm:inline">
          {TYPE_LABELS[type] ?? type}
        </span>

        {/* Botón actualizar */}
        <button
          type="button"
          onClick={onRefresh}
          title="Actualizar datos"
          className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Botones de edición (solo en modo edición del dashboard) */}
        {isEditing && (
          <>
            <button
              type="button"
              onClick={onEdit}
              title="Configurar widget"
              className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:bg-sky-100 hover:text-[#29468b]"
            >
              <Settings2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar widget"
              className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>

      {/* ── Cuerpo ── */}
      <div className="relative flex-1 min-h-0 p-2">
        {/* Overlay carga */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f9f9fa]/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Consultando…
            </div>
          </div>
        )}

        {/* Overlay error */}
        {!loading && error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f9f9fa]/90 px-4 text-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-[11px] text-red-600">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="text-[10px] text-[#29468b] underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
