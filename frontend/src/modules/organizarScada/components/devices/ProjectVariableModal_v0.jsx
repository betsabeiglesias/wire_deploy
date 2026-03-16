// src/modules/organizarScada/components/devices/ProjectVariableModal.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useScadaConfig } from "../../../../context/ScadaConfigProvider";
import api from "../../../../services/api";

const DATATYPES = ["Float", "Bool", "Int", "String", "Double"];

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchVariables = (projectId) =>
  api.get(`/api/project-variables/variables/?project=${projectId}`).then((r) => r.data);

const createVariable = (payload) =>
  api.post("/api/project-variables/variables/", payload).then((r) => r.data);

const updateVariable = (id, payload) =>
  api.patch(`/api/project-variables/variables/${id}/`, payload).then((r) => r.data);

const deleteVariable = (id) =>
  api.delete(`/api/project-variables/variables/${id}/`);

const ProjectVariableModal = ({ open, onClose, projectId }) => {

  const { config, loading: tagsLoading } = useScadaConfig();

  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const [drafts, setDrafts] = useState({});
  const [newRows, setNewRows] = useState([]);

  const tagIndex = config?.tagIndex ?? {};

  const variablesByEquipment = useMemo(() => {
    const map = {};
    Object.values(tagIndex).forEach((tag) => {
      const eq = tag.equipment;
      if (!eq) return;

      if (!map[eq]) map[eq] = [];

      map[eq].push({
        key: `${eq}::${tag.variable}`,
        variableName: tag.variable,
        datatype: tag.datatype || "",
        unit: tag.unit || "",
      });
    });

    return map;
  }, [tagIndex]);

  const equipmentOptions = useMemo(
    () => Object.keys(variablesByEquipment).sort(),
    [variablesByEquipment]
  );

  // ── Load variables ───────────────────────────────────────────────────────────
  const loadVariables = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchVariables(projectId);
      setVariables(data);
    } catch {
      setError("No se pudieron cargar las variables del proyecto.");
    } finally {
      setLoading(false);
    }

  }, [projectId]);

  useEffect(() => {
    if (open && projectId) {
      loadVariables();
      setDrafts({});
      setNewRows([]);
    }
  }, [open, projectId, loadVariables]);

  // ── Draft helpers ────────────────────────────────────────────────────────────
  const patchDraft = (id, patch) =>
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...patch },
    }));

  // ── Persisted row operations ─────────────────────────────────────────────────
  const handleSaveRow = async (variable) => {

    const draft = drafts[variable.id];
    if (!draft) return;

    setSaving(variable.id);

    try {
      const updated = await updateVariable(variable.id, draft);

      setVariables((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v))
      );

      setDrafts((prev) => {
        const next = { ...prev };
        delete next[variable.id];
        return next;
      });

    } catch {
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteRow = async (id) => {

    if (!confirm("¿Eliminar esta variable?")) return;

    setSaving(id);

    try {

      await deleteVariable(id);

      setVariables((prev) => prev.filter((v) => v.id !== id));

      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

    } catch {
      setError("Error al eliminar la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── New row operations ───────────────────────────────────────────────────────
  const addNewRow = (source = "connection") => {

    const tmpId = `new-${Date.now()}`;

    setNewRows((prev) => [
      ...prev,
      {
        tmpId,
        name: "",
        source,
        equipment: "",
        variable: "",
        datatype: "Float",
        unit: "",
        initial_value: "",
      },
    ]);
  };

  const patchNewRow = (tmpId, patch) =>
    setNewRows((prev) =>
      prev.map((r) => (r.tmpId !== tmpId ? r : { ...r, ...patch }))
    );

  const removeNewRow = (tmpId) =>
    setNewRows((prev) => prev.filter((r) => r.tmpId !== tmpId));

  const handleCreateRow = async (row) => {

    if (!row.name.trim()) {
      setError("El alias de la variable no puede estar vacío.");
      return;
    }

    if (row.source === "connection" && (!row.equipment || !row.variable)) {
      setError("Selecciona equipo y variable para variables de conexión.");
      return;
    }

    setSaving(row.tmpId);
    setError(null);

    try {

      const payload = {
        project: projectId,
        name: row.name.trim(),
        source: row.source,
        equipment: row.source === "connection" ? row.equipment : "",
        variable: row.source === "connection" ? row.variable : "",
        datatype: row.datatype || "Float",
        unit: row.unit || "",
        initial_value: row.source === "local" ? row.initial_value : null,
      };

      const created = await createVariable(payload);

      setVariables((prev) => [...prev, created]);

      removeNewRow(row.tmpId);

    } catch {
      setError("Error al crear la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────────
  const renderPersistedRow = (variable) => {

    const draft = drafts[variable.id] || {};
    const row = { ...variable, ...draft };

    const isDirty = variable.id in drafts;
    const isSaving = saving === variable.id;

    const eqVars = variablesByEquipment[row.equipment] || [];

    return (
      <tr
        key={variable.id}
        className={[
          "border-t border-slate-100",
          isDirty ? "bg-amber-50" : "hover:bg-slate-50",
        ].join(" ")}
      >

        {/* Alias */}
        <td className="p-2">
          <input
            className="w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
            value={row.name}
            onChange={(e) =>
              patchDraft(variable.id, { name: e.target.value })
            }
          />
        </td>

        {/* Source */}
        <td className="p-2">
          <select
            className="w-full rounded border border-slate-200 px-1 py-1 text-[11px]"
            value={row.source}
            onChange={(e) => {
              const src = e.target.value;

              patchDraft(variable.id, {
                source: src,
                equipment: "",
                variable: "",
                datatype: "Float",
                unit: "",
                initial_value: "",
              });
            }}
          >
            <option value="connection">Conexión</option>
            <option value="local">Local</option>
          </select>
        </td>

        {/* Equipment / Initial value */}
        <td className="p-2">
          {row.source === "connection" ? (
            <select
              className="w-full rounded border border-slate-200 px-1 py-1 text-[11px]"
              value={row.equipment}
              onChange={(e) =>
                patchDraft(variable.id, {
                  equipment: e.target.value,
                  variable: "",
                  datatype: "Float",
                  unit: "",
                })
              }
            >
              <option value="">Equipo</option>

              {tagsLoading
                ? <option disabled>Cargando…</option>
                : equipmentOptions.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))
              }
            </select>
          ) : (
            <input
              className="w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
              placeholder="Valor inicial"
              value={row.initial_value ?? ""}
              onChange={(e) =>
                patchDraft(variable.id, {
                  initial_value: e.target.value,
                })
              }
            />
          )}
        </td>

        {/* Variable */}
        <td className="p-2">
          {row.source === "connection" ? (
            <select
              className="w-full rounded border border-slate-200 px-1 py-1 text-[11px]"
              value={row.variable}
              disabled={!row.equipment}
              onChange={(e) => {

                const v = eqVars.find(
                  (x) => x.variableName === e.target.value
                );

                patchDraft(variable.id, {
                  variable: e.target.value,
                  datatype: v?.datatype || "Float",
                  unit: v?.unit || "",
                });

              }}
            >
              <option value="">Variable</option>

              {eqVars.map((v) => (
                <option key={v.key} value={v.variableName}>
                  {v.variableName}
                  {v.unit ? ` [${v.unit}]` : ""}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-slate-400">—</span>
          )}
        </td>

        {/* Datatype */}
        <td className="p-2">
          {row.source === "local" ? (
            <select
              className="w-full rounded border border-slate-200 px-1 py-1 text-[11px]"
              value={row.datatype}
              onChange={(e) =>
                patchDraft(variable.id, { datatype: e.target.value })
              }
            >
              {DATATYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-slate-500">
              {row.datatype ?? "—"}
            </span>
          )}
        </td>

        {/* Unit */}
        <td className="p-2 text-[11px] text-slate-500">
          {row.unit ?? "—"}
        </td>

        {/* Actions */}
        <td className="p-2">

          <div className="flex gap-1">

            {isDirty && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveRow(variable)}
                className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] text-white"
              >
                {isSaving ? "…" : "✓"}
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleDeleteRow(variable.id)}
              className="text-rose-400 hover:text-rose-600 text-xs px-1"
            >
              ×
            </button>

          </div>

        </td>
      </tr>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center">
      <div className="w-[1100px] h-[650px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">

        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">
            Variables del Proyecto
          </h2>

          <button
            onClick={onClose}
            className="px-2 text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto">

          <table className="w-full text-xs">

            <thead className="bg-slate-100 sticky top-0">

              <tr>
                <th className="p-2 text-left">Alias</th>
                <th className="p-2 text-left">Origen</th>
                <th className="p-2 text-left">Equipo / Valor</th>
                <th className="p-2 text-left">Variable</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Unidad</th>
                <th className="p-2"></th>
              </tr>

            </thead>

            <tbody>
              {variables.map(renderPersistedRow)}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
};

export default ProjectVariableModal;