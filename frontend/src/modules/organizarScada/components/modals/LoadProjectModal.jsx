// src/modules/organizarScada/components/modals/LoadProjectModal.jsx
//
// Modal para cargar un proyecto existente desde la base de datos.
// Lista todos los layouts del usuario con nombre, fecha y nº de vistas.
// Al seleccionar uno lo carga en el editor.
//
import React, { useEffect, useState } from "react";
import api from "../../../../services/api";

export default function LoadProjectModal({ open, onClose, onLoad }) {
  const [layouts,  setLayouts]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    api.get("/api/scada-manager/my-layouts/")
      .then(r => setLayouts(r.data || []))
      .catch(() => setError("No se pudieron cargar los proyectos."))
      .finally(() => setLoading(false));
  }, [open]);

  const handleLoad = async (layout) => {
    setLoadingId(layout.id);
    try {
      // Cargar el detalle completo (vistas + elementos)
      const r = await api.get(`/api/scada-manager/layout/${layout.id}/`);
      onLoad(r.data, layout.id, layout.name);
      onClose();
    } catch {
      setError(`No se pudo cargar "${layout.name}".`);
    } finally {
      setLoadingId(null);
    }
  };

  if (!open) return null;

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center">
      <div className="w-[640px] max-w-[96vw] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">Mis proyectos</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between bg-rose-50 border-b border-rose-200 px-4 py-2 text-[11px] text-rose-700 shrink-0">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[12px] text-slate-400">
              Cargando proyectos…
            </div>
          ) : layouts.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[12px] text-slate-400">
              No tienes proyectos guardados todavía.
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Nombre</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-600 w-32">Última edición</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-600 w-24">Vistas</th>
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {layouts.map(layout => (
                  <tr key={layout.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {layout.name || "Sin nombre"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(layout.updated_at || layout.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {layout.views_data?.views?.length ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleLoad(layout)}
                        disabled={loadingId === layout.id}
                        className="rounded border border-sky-300 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                      >
                        {loadingId === layout.id ? "Cargando…" : "Abrir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 shrink-0 text-right">
          <button onClick={onClose}
            className="px-3 py-1.5 text-[12px] rounded border border-slate-300 hover:bg-slate-100 text-slate-600">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
