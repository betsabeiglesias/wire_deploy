// frontend/src/modules/scada/pages/PLCTagsPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPLC } from "../api/plcApi";
import WizardNavigation from "@/components/WizardNavigationButton";
import Swal from "sweetalert2";
import { deleteTag, toggleTag } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";

export default function PLCTagsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plc, setPlc] = useState(null);
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

  // ========================================
  // 🔥 HANDLE DELETE TAG
  // ========================================
  async function handleDelete(tagId) {
    const confirm = await Swal.fire({
      title: "Delete variable?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteTag(id, tagId);

      Swal.fire({
        icon: "success",
        title: "Variable deleted",
        timer: 1200,
        showConfirmButton: false
      });

      // Recargar PLC
      const updated = await getPLC(id);
      setPlc(updated);

      // 🔥 Marcar configuración como sucia
      markConfigDirty();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error deleting variable",
        text: err.message || "Unknown error"
      });
    }
  }

  // ========================================
  // 🔥 HANDLE TOGGLE TAG ENABLED
  // ========================================
  async function handleToggleTag(tagId, currentState) {
     try {
      await toggleTag(id, tagId, !currentState);

      // Recargar PLC para mostrar cambios
      const updated = await getPLC(id);
      setPlc(updated);

      // 🔥 Marcar configuración como sucia
      markConfigDirty();

      // Feedback visual rápido
      Swal.fire({
        icon: "success",
        title: currentState ? "Tag disabled" : "Tag enabled",
        timer: 800,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error toggling tag",
        text: err.message || "Unknown error"
      });
    }
  }

  if (loading) return <div className="p-6">Loading PLC...</div>;
  if (!plc) return <div className="p-6 text-red-600">PLC not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">{plc.name}</h1>

      {/* ---------- GENERAL INFO ---------- */}
      <div className="border rounded p-4 bg-white shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">General Information</h2>
        <div className="grid grid-cols-2 gap-3">
          <p><strong>Driver:</strong> {plc.driver_name}</p>
          <p><strong>Work Unit:</strong> {plc.work_unit_detail?.name}</p>
          <p><strong>IP Address:</strong> {plc.connection_string}</p>
          <p><strong>Enabled:</strong> {plc.enabled ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* ---------- VARIABLES ---------- */}
      <div className="border rounded p-4 bg-white shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Variables</h2>
          <span className="text-sm text-gray-600">
            {plc.tags?.filter(t => t.enabled).length || 0} enabled / {plc.tags?.length || 0} total
          </span>
        </div>

        {plc.tags?.length > 0 ? (
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border w-20">Status</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Data Type</th>
                <th className="p-2 border">Unit</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plc.tags.map((tag) => (
                <tr 
                  key={tag.id}
                  className={`
                    ${tag.enabled ? '' : 'bg-gray-50 text-gray-500'}
                    transition-colors
                  `}
                >
                  {/* 🔥 COLUMNA DE STATUS CON CHECKBOX */}
                  <td className="p-2 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span 
                        className={`
                          w-2 h-2 rounded-full
                          ${tag.enabled ? 'bg-green-500' : 'bg-gray-400'}
                        `}
                        title={tag.enabled ? 'Enabled' : 'Disabled'}
                      />
                      <input
                        type="checkbox"
                        checked={tag.enabled}
                        onChange={() => handleToggleTag(tag.id, tag.enabled)}
                        className="w-4 h-4 cursor-pointer"
                        title={tag.enabled ? 'Click to disable' : 'Click to enable'}
                      />
                    </div>
                  </td>

                  <td className="p-2 border font-medium">{tag.name}</td>
                  <td className="p-2 border font-mono text-sm">{tag.address}</td>
                  <td className="p-2 border">{tag.datatype}</td>
                  <td className="p-2 border">{tag.unit || '-'}</td>

                  {/* --- ACTION BUTTONS --- */}
                  <td className="p-2 border text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        onClick={() => navigate(`/devices/${id}/variables/${tag.id}/edit`)}
                        title="Edit variable"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        onClick={() => handleDelete(tag.id)}
                        title="Delete variable"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-600 text-center p-4 border rounded bg-gray-50">
            No variables defined. Click "+ Create Variable" to add one.
          </div>
        )}
      </div>

      {/* ---------- WIZARD NAVIGATION ---------- */}
      <WizardNavigation
        backTo="/devices"
        nextTo={`/devices/${id}/variables/new`}
        nextLabel="+ Create Variable"
        nextClassName="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
}