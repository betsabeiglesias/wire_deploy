/**
 * HistorianDashboard.jsx
 *
 * Dashboard individual del Historian.
 * Ruta: /historian/dashboards/:id
 *
 * Estética industrial: top bar azul + left rail + grid de widgets compactos.
 * Las acciones de edición (editar / guardar / cancelar / añadir widget)
 * viven en el slot derecho del top bar.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Plus, Save, X, LayoutGrid, CheckCircle2 } from "lucide-react";

import HistorianLayout from "../components/HistorianChrome";
import ChartWidget from "../widgets/ChartWidget";
import TableWidget from "../widgets/TableWidget";
import KpiWidget from "../widgets/KpiWidget";
import WidgetConfigPanel from "../widgets/WidgetConfigPanel";
import { getDashboard, updateDashboard } from "@/services/dashboardService";

/* ── Render de widget por tipo ────────────────────────────────────────────── */
function renderWidget(widget, isEditing, onEdit, onDelete) {
  const props = { key: widget.id, config: widget, isEditing, onEdit, onDelete };
  switch (widget.type) {
    case "chart": return <ChartWidget {...props} />;
    case "table": return <TableWidget {...props} />;
    case "kpi":   return <KpiWidget   {...props} />;
    default:
      return (
        <div
          key={widget.id}
          className="flex h-32 items-center justify-center rounded-[4px] border border-dashed border-slate-300 bg-[#f9f9fa] text-[11px] text-slate-400"
        >
          Tipo desconocido: {widget.type}
        </div>
      );
  }
}

/* ── Página ───────────────────────────────────────────────────────────────── */
export default function HistorianDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState(null);

  /* Carga inicial */
  useEffect(() => {
    setLoading(true);
    getDashboard(id)
      .then((d) => {
        setDashboard(d);
        setDraft(JSON.parse(JSON.stringify(d)));
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Gestión de edición ── */
  const handleStartEdit = () => {
    setDraft(JSON.parse(JSON.stringify(dashboard)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(JSON.parse(JSON.stringify(dashboard)));
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDashboard(id, {
        title: draft.title,
        description: draft.description,
        widgets: draft.widgets,
      });
      setDashboard(updated);
      setDraft(JSON.parse(JSON.stringify(updated)));
      setIsEditing(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (e) {
      alert(`Error al guardar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ── Gestión de widgets ── */
  const handleAddWidget    = () => setConfiguringWidget({ _isNew: true });
  const handleEditWidget   = useCallback((w) => setConfiguringWidget(w), []);
  const handleDeleteWidget = useCallback((wId) => {
    setDraft((d) => ({ ...d, widgets: d.widgets.filter((w) => w.id !== wId) }));
  }, []);

  const handleSaveWidget = ({ _isNew, ...clean }) => {
    setDraft((d) => {
      const exists = d.widgets.some((w) => w.id === clean.id);
      return {
        ...d,
        widgets: exists
          ? d.widgets.map((w) => (w.id === clean.id ? clean : w))
          : [...d.widgets, clean],
      };
    });
    setConfiguringWidget(null);
  };

  /* ── Slot derecho del top bar ── */
  const rightSlot = loading || loadError ? null : (
    <div className="flex items-center gap-2">
      {/* Flash guardado */}
      {savedFlash && (
        <span className="flex items-center gap-1 text-[11px] text-white/80">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Guardado
        </span>
      )}

      {/* Badge modo edición */}
      {isEditing && (
        <span className="rounded-[4px] border border-amber-300 bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-200">
          Editando
        </span>
      )}

      {!isEditing ? (
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-1.5 rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
      ) : (
        <>
          <button
            onClick={handleAddWidget}
            className="flex items-center gap-1.5 rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir widget
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1 rounded-[4px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/80 hover:bg-white/20 transition-colors disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-[4px] bg-white px-3 py-1 text-[11px] font-semibold text-[#29468b] hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>
      )}
    </div>
  );

  /* ── Estado de carga ── */
  if (loading) {
    return (
      <HistorianLayout subtitle="Cargando…">
        <div className="flex h-full items-center justify-center">
          <div className="rounded-[6px] border border-[#d6d9e2] bg-[#fbfbfc] px-8 py-6 text-[12px] text-slate-400">
            Cargando dashboard…
          </div>
        </div>
      </HistorianLayout>
    );
  }

  /* ── Estado de error ── */
  if (loadError || !draft) {
    return (
      <HistorianLayout subtitle="Error">
        <div className="flex h-full items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 rounded-[6px] border border-red-200 bg-white p-8 text-center shadow">
            <span className="text-3xl">⚠️</span>
            <div className="text-[13px] font-semibold text-slate-700">Dashboard no encontrado</div>
            <div className="text-[11px] text-slate-400">{loadError}</div>
            <button
              onClick={() => navigate("/historian/dashboards")}
              className="mt-2 rounded-[4px] bg-[#29468b] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#3558a8]"
            >
              Volver al listado
            </button>
          </div>
        </div>
      </HistorianLayout>
    );
  }

  const widgets = draft.widgets ?? [];

  return (
    <HistorianLayout subtitle={draft.title} rightSlot={rightSlot}>
      <div className="flex h-full flex-col">

        {/* Barra de contexto: breadcrumb + descripción */}
        <div className="shrink-0 border-b border-slate-300 bg-[#f4f6f9] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <button
              onClick={() => navigate("/historian/dashboards")}
              className="hover:text-[#29468b] transition-colors"
            >
              Dashboards
            </button>
            <span>/</span>
            <span className="font-medium text-slate-600 truncate max-w-[300px]">
              {draft.title}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {widgets.length} {widgets.length === 1 ? "widget" : "widgets"}
          </div>
        </div>

        {/* Grid de widgets */}
        <div className="flex-1 overflow-auto p-2">
          {widgets.length === 0 ? (
            /* Estado vacío */
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[6px] border border-[#d6d9e2] bg-[#f4f6f9]">
                <LayoutGrid className="h-6 w-6 text-slate-300" />
              </div>
              <div className="text-[13px] font-semibold text-slate-600">Sin widgets</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {isEditing
                  ? 'Pulsa "Añadir widget" en la barra superior.'
                  : 'Pulsa "Editar" para añadir widgets a este dashboard.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={widget.colSpan === 2 ? "md:col-span-2" : ""}
                >
                  {renderWidget(
                    widget,
                    isEditing,
                    () => handleEditWidget(widget),
                    () => handleDeleteWidget(widget.id)
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel de configuración de widget */}
      {configuringWidget && (
        <WidgetConfigPanel
          widget={configuringWidget}
          onSave={handleSaveWidget}
          onCancel={() => setConfiguringWidget(null)}
        />
      )}
    </HistorianLayout>
  );
}
