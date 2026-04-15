// frontend/src/modules/scada/pages/TagsPLCPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPLC, deleteTag, toggleTag } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function PLCTagsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plc, setPlc]         = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPLC = async () => {
      try {
        const data = await getPLC(id);
        setPlc(data);
      } catch (err) {
        console.error("Error loading PLC detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPLC();
  }, [id]);

  async function handleDelete(tagId) {
    const confirm = await Swal.fire({
      title: "¿Eliminar variable?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteTag(id, tagId);
      Swal.fire({ icon: "success", title: "Variable eliminada", timer: 1200, showConfirmButton: false });
      const updated = await getPLC(id);
      setPlc(updated);
      markConfigDirty();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al eliminar variable", text: err.message || "Error desconocido" });
    }
  }

  async function handleToggleTag(tagId, currentState) {
    try {
      await toggleTag(id, tagId, !currentState);
      const updated = await getPLC(id);
      setPlc(updated);
      markConfigDirty();
      Swal.fire({ icon: "success", title: currentState ? "Tag deshabilitado" : "Tag habilitado", timer: 800, showConfirmButton: false, toast: true, position: "top-end" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al cambiar estado del tag", text: err.message || "Error desconocido" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 h-48">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#29468B]" />
        <p className="text-[12px] text-slate-500">Cargando PLC...</p>
      </div>
    );
  }

  if (!plc) {
    return <div className="p-4 text-[12px] text-[#DC2626] font-medium">PLC no encontrado.</div>;
  }

  const enabledCount = plc.tags?.filter((t) => t.enabled).length || 0;
  const totalCount   = plc.tags?.length || 0;

  const btnSecondary = "inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium border border-slate-300 bg-white text-slate-700 rounded-[4px] hover:border-slate-400 transition-colors";
  const btnDanger    = "inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] rounded-[4px] hover:brightness-95 transition-colors";

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* ── Header de página ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          {plc.name}
        </h1>
        <button
          onClick={() => navigate(`/devices/${id}/variables/new`)}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium bg-[#29468B] text-white rounded-[4px] hover:bg-[#1F3A73] transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Crear variable
        </button>
      </div>

      {/* ── KPI de info general ─────────────────────────────────────── */}
      <div className="flex gap-2 px-3 py-2 bg-[#F9F9FA] border-b border-slate-200 overflow-x-auto">
        {[
          { label: "Driver",          value: plc.driver_name },
          { label: "Unidad de trabajo", value: plc.work_unit_detail?.name || "—" },
          { label: "Dirección IP",    value: plc.connection_string, mono: true },
          { label: "Habilitado",      value: plc.enabled ? "Sí" : "No" },
          { label: "Variables",       value: `${enabledCount} / ${totalCount}` },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex flex-col px-3 py-1.5 rounded-[4px] border border-slate-200 bg-white min-w-fit">
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">{label}</span>
            <span className={`text-[12px] font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Tabla de variables ──────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-3">
        {plc.tags?.length > 0 ? (
          <div className="rounded-[4px] border border-slate-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#EEF2F8] border-b border-slate-200">
                  {["Estado", "Nombre", "Dirección", "Tipo de dato", "Unidad", "Acciones"].map((col) => (
                    <th key={col} className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-700 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plc.tags.map((tag, i) => (
                  <tr
                    key={tag.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors ${
                      tag.enabled
                        ? i % 2 === 0 ? "bg-white" : "bg-slate-50"
                        : "bg-slate-50 opacity-60"
                    }`}
                  >
                    {/* STATUS + CHECKBOX */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${tag.enabled ? "bg-[#2A8B4B]" : "bg-slate-300"}`}
                          title={tag.enabled ? "Habilitado" : "Deshabilitado"}
                        />
                        <input
                          type="checkbox"
                          checked={tag.enabled}
                          onChange={() => handleToggleTag(tag.id, tag.enabled)}
                          className="w-4 h-4 cursor-pointer accent-[#29468B]"
                          title={tag.enabled ? "Clic para deshabilitar" : "Clic para habilitar"}
                        />
                      </div>
                    </td>

                    <td className="px-2 py-2 font-medium text-slate-800">{tag.name}</td>
                    <td className="px-2 py-2 font-mono text-[11px] text-slate-500">{tag.address}</td>
                    <td className="px-2 py-2 text-slate-600">{tag.datatype}</td>
                    <td className="px-2 py-2 text-slate-500">{tag.unit || "—"}</td>

                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <button
                          className={btnSecondary}
                          onClick={() => navigate(`/devices/${id}/variables/${tag.id}/edit`)}
                          title="Editar variable"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          className={btnDanger}
                          onClick={() => handleDelete(tag.id)}
                          title="Eliminar variable"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-slate-200 rounded-[4px] bg-white">
            <p className="text-[12px] text-slate-400">No hay variables definidas.</p>
            <button
              onClick={() => navigate(`/devices/${id}/variables/new`)}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium bg-[#29468B] text-white rounded-[4px] hover:bg-[#1F3A73] transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear primera variable
            </button>
          </div>
        )}
      </div>

      {/* ── Navegación wizard ───────────────────────────────────────── */}
      <div className="px-3 py-2 bg-white border-t border-slate-200">
        <WizardNavigation backTo="/devices" nextTo={null} nextLabel="" />
      </div>
    </div>
  );
}
