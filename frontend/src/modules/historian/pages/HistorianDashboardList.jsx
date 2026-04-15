/**
 * HistorianDashboardList.jsx
 *
 * Listado de dashboards de Historian.
 * Ruta: /historian/dashboards
 *
 * Estética industrial: top bar azul + left rail + grid de tarjetas compactas.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Clock, ArrowRight, BarChart2, X } from "lucide-react";

import HistorianLayout from "../components/HistorianChrome";
import {
  listDashboards,
  createDashboard,
  deleteDashboard,
} from "@/services/dashboardService";

/* ── Tarjeta de dashboard ─────────────────────────────────────────────────── */
function DashboardCard({ dashboard, onOpen, onDelete }) {
  const widgetCount = dashboard.widgets?.length ?? 0;
  const updatedAt = new Date(dashboard.updated_at).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[6px] border border-[#d6d9e2] bg-[#fbfbfc] shadow-[0_1px_3px_rgba(0,0,0,0.07)] transition-all hover:border-[#29468b]/40 hover:shadow-[0_2px_8px_rgba(41,70,139,0.12)]"
    >
      {/* Franja de color superior */}
      <div className="h-[3px] bg-[#29468b]" />

      <div className="flex flex-1 flex-col p-3 gap-2">
        {/* Título + descripción */}
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold text-slate-800">
            {dashboard.title}
          </h3>
          {dashboard.description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              {dashboard.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>
            {widgetCount} {widgetCount === 1 ? "widget" : "widgets"}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {updatedAt}
          </span>
        </div>
      </div>

      {/* Pie */}
      <div className="flex items-center justify-between border-t border-[#e8ebf0] bg-[#f4f6f9] px-3 py-2">
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#29468b] group-hover:underline">
          Abrir <ArrowRight className="h-3 w-3" />
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar dashboard"
          className="rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

/* ── Modal nuevo dashboard ────────────────────────────────────────────────── */
function NewDashboardModal({ onCreate, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate(title.trim(), description.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[6px] bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f4f6f9] px-4 py-3">
          <span className="text-[13px] font-semibold text-slate-700">
            Nuevo dashboard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Producción Línea 3 — Temperatura"
              className="w-full rounded-[4px] border border-slate-300 px-2.5 py-1.5 text-[12px] focus:border-[#29468b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
              Descripción{" "}
              <span className="font-normal text-slate-300">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Breve descripción…"
              className="w-full resize-none rounded-[4px] border border-slate-300 px-2.5 py-1.5 text-[12px] focus:border-[#29468b] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] border border-slate-300 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="rounded-[4px] bg-[#29468b] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#3558a8] disabled:opacity-40"
            >
              {saving ? "Creando…" : "Crear dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────────────────── */
export default function HistorianDashboardList() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    listDashboards()
      .then(setDashboards)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (title, description) => {
    const dashboard = await createDashboard({ title, description });
    navigate(`/historian/dashboards/${dashboard.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este dashboard?")) return;
    await deleteDashboard(id);
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  /* Slot derecho del top bar */
  const rightSlot = (
    <button
      onClick={() => setShowNewModal(true)}
      className="flex items-center gap-1.5 rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
      Nuevo dashboard
    </button>
  );

  return (
    <HistorianLayout subtitle="Dashboards" rightSlot={rightSlot}>
      <div className="p-3">

        {/* Cabecera de sección */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {loading
              ? "Cargando…"
              : `${dashboards.length} ${dashboards.length === 1 ? "dashboard" : "dashboards"} guardados`}
          </div>
          <button
            onClick={() => navigate("/historian")}
            className="text-[11px] text-[#29468b] hover:underline"
          >
            ← Consulta manual
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[6px] border border-[#e2e6ed] bg-[#f0f2f5]"
              />
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#d6d9e2] bg-[#f4f6f9]">
              <BarChart2 className="h-7 w-7 text-slate-300" />
            </div>
            <div className="text-[13px] font-semibold text-slate-600">
              Sin dashboards todavía
            </div>
            <div className="mt-1 max-w-xs text-[11px] text-slate-400">
              Crea tu primer dashboard y añade widgets con gráficos, tablas o KPIs.
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 flex items-center gap-1.5 rounded-[4px] bg-[#29468b] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3558a8] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear primer dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboards.map((d) => (
              <DashboardCard
                key={d.id}
                dashboard={d}
                onOpen={() => navigate(`/historian/dashboards/${d.id}`)}
                onDelete={() => handleDelete(d.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <NewDashboardModal
          onCreate={handleCreate}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </HistorianLayout>
  );
}
