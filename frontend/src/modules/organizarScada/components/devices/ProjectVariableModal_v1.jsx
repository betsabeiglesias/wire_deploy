// src/modules/organizarScada/components/devices/ProjectVariableModal.jsx
//
// Gestor de variables del proyecto.
// Dos tabs separados con columnas específicas:
//
//  ── CONEXIÓN ──────────────────────────────────────────────────────────────
//  Variables vinculadas a tags reales del PLC (tagIndex de la API).
//  Columnas: Alias | Equipo | Variable | Tipo | Unidad | Dirección | Nodo
//
//  ── LOCAL ─────────────────────────────────────────────────────────────────
//  Variables internas creadas por el usuario para usar en scripts.
//  Sin origen PLC. El "Valor inicial" es el punto de partida para el script engine.
//  Columnas: Alias | Tipo | Valor inicial | Descripción
//
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useScadaConfig } from "../../../../context/ScadaConfigProvider";
import api from "../../../../services/api";

const DATATYPES = ["Float", "Bool", "Int", "String", "Double"];

// ── API helpers ───────────────────────────────────────────────────────────────
// Las variables están anidadas bajo el layout: /api/layouts/<layoutId>/variables/
const fetchVariables  = (layoutId) =>
  api.get(`/api/layouts/${layoutId}/variables/`).then((r) => r.data);
const createVariable  = (layoutId, payload) =>
  api.post(`/api/layouts/${layoutId}/variables/`, payload).then((r) => r.data);
const updateVariable  = (layoutId, id, payload) =>
  api.patch(`/api/layouts/${layoutId}/variables/${id}/`, payload).then((r) => r.data);
const deleteVariable  = (layoutId, id) =>
  api.delete(`/api/layouts/${layoutId}/variables/${id}/`);

// ── Helpers ───────────────────────────────────────────────────────────────────
const cls = (...parts) => parts.filter(Boolean).join(" ");

const INPUT  = "w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:border-sky-400 focus:outline-none bg-white";
const INPUT_NEW = "w-full rounded border border-sky-300 px-2 py-1 text-[11px] focus:border-sky-500 focus:outline-none bg-white";
const SELECT = INPUT;
const SELECT_NEW = INPUT_NEW;
const READONLY = "text-[11px] text-slate-500 truncate";

// ─────────────────────────────────────────────────────────────────────────────

const ProjectVariableModal = ({ open, onClose, layoutId }) => {
  const { config, loading: tagsLoading } = useScadaConfig();

  const [activeTab,  setActiveTab]  = useState("connection"); // "connection" | "local"
  const [variables,  setVariables]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(null);
  const [error,      setError]      = useState(null);
  const [drafts,     setDrafts]     = useState({});   // { [id]: partialPatch }
  const [newRows,    setNewRows]    = useState([]);   // pending creation

  // ── Tag catalog ──────────────────────────────────────────────────────────────
  const tagIndex = config?.tagIndex || {};

  const variablesByEquipment = useMemo(() => {
    const map = {};
    Object.values(tagIndex).forEach((tag) => {
      const eq = tag.equipment;
      if (!eq) return;
      if (!map[eq]) map[eq] = [];
      map[eq].push({
        key:          `${eq}::${tag.variable}`,
        variableName: tag.variable  || "",
        datatype:     tag.datatype  || "",
        unit:         tag.unit      || "",
        address:      typeof tag.address === "string"
                        ? tag.address
                        : tag.address?.value || "",
        nodeId:       tag.nodeId    || tag.node_id || "",
      });
    });
    return map;
  }, [tagIndex]);

  const equipmentOptions = useMemo(
    () => Object.keys(variablesByEquipment).sort(),
    [variablesByEquipment]
  );

  // ── Split by source ───────────────────────────────────────────────────────────
  const connectionVars = variables.filter((v) => v.source === "connection");
  const localVars      = variables.filter((v) => v.source === "local");

  // ── Load ──────────────────────────────────────────────────────────────────────
  const loadVariables = useCallback(async () => {
    if (!layoutId) return;
    setLoading(true);
    setError(null);
    try {
      setVariables(await fetchVariables(layoutId));
    } catch {
      setError("No se pudieron cargar las variables del proyecto.");
    } finally {
      setLoading(false);
    }
  }, [layoutId]);

  useEffect(() => {
    if (open && layoutId) {
      loadVariables();
      setDrafts({});
      setNewRows([]);
    }
  }, [open, layoutId, loadVariables]);

  // ── Draft helpers ─────────────────────────────────────────────────────────────
  const getDraft  = (id, base)  => (id in drafts ? { ...base, ...drafts[id] } : base);
  const patchDraft = (id, patch) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));
  const discardDraft = (id) =>
    setDrafts((prev) => { const n = { ...prev }; delete n[id]; return n; });

  // ── Save / delete existing ────────────────────────────────────────────────────
  const handleSaveRow = async (variable) => {
    const draft = drafts[variable.id];
    if (!draft) return;
    setSaving(variable.id);
    setError(null);
    try {
      const updated = await updateVariable(layoutId, variable.id, draft);
      setVariables((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      discardDraft(variable.id);
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
      await deleteVariable(layoutId, id);
      setVariables((prev) => prev.filter((v) => v.id !== id));
      discardDraft(id);
    } catch {
      setError("Error al eliminar la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── New row helpers ───────────────────────────────────────────────────────────
  const addNewRow = (source) => {
    const tmpId = `new-${Date.now()}`;
    setNewRows((prev) => [
      ...prev,
      {
        tmpId,
        source,
        name:          "",
        equipment:     "",
        variable:      "",
        datatype:      "Float",
        unit:          "",
        address:       "",
        nodeId:        "",
        initial_value: "",
        description:   "",
      },
    ]);
  };

  const patchNewRow  = (tmpId, patch) =>
    setNewRows((prev) => prev.map((r) => r.tmpId !== tmpId ? r : { ...r, ...patch }));
  const removeNewRow = (tmpId) =>
    setNewRows((prev) => prev.filter((r) => r.tmpId !== tmpId));

  const handleCreateRow = async (row) => {
    if (!row.name.trim()) {
      setError("El alias no puede estar vacío.");
      return;
    }
    if (row.source === "connection" && (!row.equipment || !row.variable)) {
      setError("Las variables de conexión requieren equipo y variable.");
      return;
    }
    setSaving(row.tmpId);
    setError(null);
    try {
      const created = await createVariable(layoutId, {
        name:          row.name.trim(),
        source:        row.source,
        equipment:     row.source === "connection" ? row.equipment     : "",
        variable:      row.source === "connection" ? row.variable      : "",
        datatype:      row.datatype  || "Float",
        unit:          row.unit      || "",
        address:       row.address   || "",
        node_id:       row.nodeId    || "",
        initial_value: row.source === "local" ? row.initial_value : null,
      });
      setVariables((prev) => [...prev, created]);
      removeNewRow(row.tmpId);
    } catch {
      setError("Error al crear la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── Row action buttons ────────────────────────────────────────────────────────
  const ActionCell = ({ id, isDirty, onSave, onDelete }) => (
    <td className="px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1">
        {isDirty && (
          <button
            type="button"
            disabled={saving === id}
            onClick={onSave}
            className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] text-white hover:bg-emerald-600 disabled:opacity-50"
            title="Guardar"
          >
            {saving === id ? "…" : "✓"}
          </button>
        )}
        <button
          type="button"
          disabled={saving === id}
          onClick={onDelete}
          className="text-rose-400 hover:text-rose-600 disabled:opacity-40 text-sm px-1"
          title="Eliminar"
        >
          ×
        </button>
      </div>
    </td>
  );

  const NewRowActionCell = ({ tmpId, onConfirm, onCancel }) => (
    <td className="px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={saving === tmpId}
          onClick={onConfirm}
          className="rounded bg-sky-500 px-2 py-0.5 text-[10px] text-white hover:bg-sky-600 disabled:opacity-50"
          title="Confirmar"
        >
          {saving === tmpId ? "…" : "✓"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-rose-400 hover:text-rose-600 text-sm px-1"
          title="Cancelar"
        >
          ×
        </button>
      </div>
    </td>
  );

  // ── TABLE: Conexión ───────────────────────────────────────────────────────────
  // Columnas: Alias | Equipo | Variable | Tipo | Unidad | Dirección | Nodo | ⋯
  const renderConnectionTable = () => {
    const pending = newRows.filter((r) => r.source === "connection");

    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-36">Alias</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-44">Equipo</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-44">Variable</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-20">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-20">Unidad</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-44">Dirección</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-44">Nodo</th>
              <th className="px-3 py-2 border-b border-slate-200 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {/* Existing rows */}
            {connectionVars.map((variable) => {
              const d       = getDraft(variable.id, variable);
              const isDirty = variable.id in drafts;
              const eqVars  = variablesByEquipment[d.equipment] || [];
              const varMeta = eqVars.find((v) => v.variableName === d.variable);

              return (
                <tr key={variable.id}
                  className={cls("border-t border-slate-100", isDirty ? "bg-amber-50" : "hover:bg-slate-50")}>

                  {/* Alias */}
                  <td className="px-3 py-1.5">
                    <input className={INPUT} value={d.name}
                      onChange={(e) => patchDraft(variable.id, { name: e.target.value })} />
                  </td>

                  {/* Equipo */}
                  <td className="px-3 py-1.5">
                    <select className={SELECT} value={d.equipment}
                      disabled={tagsLoading}
                      onChange={(e) => patchDraft(variable.id, {
                        equipment: e.target.value,
                        variable: "", datatype: "Float", unit: "", address: "", node_id: "",
                      })}>
                      <option value="">— equipo —</option>
                      {equipmentOptions.map((eq) => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </td>

                  {/* Variable */}
                  <td className="px-3 py-1.5">
                    <select className={SELECT} value={d.variable}
                      disabled={!d.equipment}
                      onChange={(e) => {
                        const v = eqVars.find((x) => x.variableName === e.target.value);
                        patchDraft(variable.id, {
                          variable: e.target.value,
                          datatype: v?.datatype || "Float",
                          unit:     v?.unit     || "",
                          address:  v?.address  || "",
                          node_id:  v?.nodeId   || "",
                        });
                      }}>
                      <option value="">— variable —</option>
                      {eqVars.map((v) => (
                        <option key={v.key} value={v.variableName}>{v.variableName}</option>
                      ))}
                    </select>
                  </td>

                  {/* Tipo — read-only, viene de API */}
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{varMeta?.datatype || d.datatype || "—"}</span>
                  </td>

                  {/* Unidad — read-only */}
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{varMeta?.unit || d.unit || "—"}</span>
                  </td>

                  {/* Dirección — read-only */}
                  <td className="px-3 py-1.5" title={varMeta?.address || d.address || ""}>
                    <span className={cls(READONLY, "block max-w-[160px] truncate")}>
                      {varMeta?.address || d.address || "—"}
                    </span>
                  </td>

                  {/* Nodo — read-only */}
                  <td className="px-3 py-1.5" title={varMeta?.nodeId || d.node_id || ""}>
                    <span className={cls(READONLY, "block max-w-[160px] truncate")}>
                      {varMeta?.nodeId || d.node_id || "—"}
                    </span>
                  </td>

                  <ActionCell id={variable.id} isDirty={isDirty}
                    onSave={() => handleSaveRow(variable)}
                    onDelete={() => handleDeleteRow(variable.id)} />
                </tr>
              );
            })}

            {/* New rows pending */}
            {pending.map((row) => {
              const eqVars = variablesByEquipment[row.equipment] || [];
              const vMeta  = eqVars.find((v) => v.variableName === row.variable);
              return (
                <tr key={row.tmpId} className="border-t border-slate-100 bg-sky-50">

                  {/* Alias */}
                  <td className="px-3 py-1.5">
                    <input className={INPUT_NEW} placeholder="Alias *" value={row.name}
                      onChange={(e) => patchNewRow(row.tmpId, { name: e.target.value })} />
                  </td>

                  {/* Equipo */}
                  <td className="px-3 py-1.5">
                    <select className={SELECT_NEW} value={row.equipment}
                      disabled={tagsLoading}
                      onChange={(e) => patchNewRow(row.tmpId, {
                        equipment: e.target.value,
                        variable: "", datatype: "Float", unit: "", address: "", nodeId: "",
                      })}>
                      <option value="">— equipo * —</option>
                      {equipmentOptions.map((eq) => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </td>

                  {/* Variable */}
                  <td className="px-3 py-1.5">
                    <select className={SELECT_NEW} value={row.variable}
                      disabled={!row.equipment}
                      onChange={(e) => {
                        const v = eqVars.find((x) => x.variableName === e.target.value);
                        patchNewRow(row.tmpId, {
                          variable: e.target.value,
                          datatype: v?.datatype || "Float",
                          unit:     v?.unit     || "",
                          address:  v?.address  || "",
                          nodeId:   v?.nodeId   || "",
                        });
                      }}>
                      <option value="">— variable * —</option>
                      {eqVars.map((v) => (
                        <option key={v.key} value={v.variableName}>{v.variableName}</option>
                      ))}
                    </select>
                  </td>

                  {/* Tipo */}
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{vMeta?.datatype || row.datatype || "—"}</span>
                  </td>

                  {/* Unidad */}
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{vMeta?.unit || row.unit || "—"}</span>
                  </td>

                  {/* Dirección */}
                  <td className="px-3 py-1.5">
                    <span className={cls(READONLY, "block max-w-[160px] truncate")}>
                      {vMeta?.address || row.address || "—"}
                    </span>
                  </td>

                  {/* Nodo */}
                  <td className="px-3 py-1.5">
                    <span className={cls(READONLY, "block max-w-[160px] truncate")}>
                      {vMeta?.nodeId || row.nodeId || "—"}
                    </span>
                  </td>

                  <NewRowActionCell tmpId={row.tmpId}
                    onConfirm={() => handleCreateRow(row)}
                    onCancel={() => removeNewRow(row.tmpId)} />
                </tr>
              );
            })}

            {connectionVars.length === 0 && pending.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[12px] text-slate-400">
                  Sin variables de conexión. Usa "+ Añadir" para vincular un tag del PLC.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ── TABLE: Local ──────────────────────────────────────────────────────────────
  // Columnas: Alias | Tipo | Valor inicial | Descripción | ⋯
  const renderLocalTable = () => {
    const pending = newRows.filter((r) => r.source === "local");

    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-48">Alias</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-32">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-40"
                title="Valor con el que arranca el script engine">
                Valor inicial
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">
                Descripción
              </th>
              <th className="px-3 py-2 border-b border-slate-200 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {/* Existing */}
            {localVars.map((variable) => {
              const d       = getDraft(variable.id, variable);
              const isDirty = variable.id in drafts;

              return (
                <tr key={variable.id}
                  className={cls("border-t border-slate-100", isDirty ? "bg-amber-50" : "hover:bg-slate-50")}>

                  {/* Alias */}
                  <td className="px-3 py-1.5">
                    <input className={INPUT} value={d.name}
                      onChange={(e) => patchDraft(variable.id, { name: e.target.value })} />
                  </td>

                  {/* Tipo — editable para locales */}
                  <td className="px-3 py-1.5">
                    <select className={SELECT} value={d.datatype || "Float"}
                      onChange={(e) => patchDraft(variable.id, { datatype: e.target.value })}>
                      {DATATYPES.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </td>

                  {/* Valor inicial */}
                  <td className="px-3 py-1.5">
                    <input className={INPUT}
                      placeholder={d.datatype === "Bool" ? "true / false" : "0"}
                      value={d.initial_value ?? ""}
                      onChange={(e) => patchDraft(variable.id, { initial_value: e.target.value })} />
                  </td>

                  {/* Descripción */}
                  <td className="px-3 py-1.5">
                    <input className={INPUT} placeholder="Para qué sirve esta variable…"
                      value={d.description ?? ""}
                      onChange={(e) => patchDraft(variable.id, { description: e.target.value })} />
                  </td>

                  <ActionCell id={variable.id} isDirty={isDirty}
                    onSave={() => handleSaveRow(variable)}
                    onDelete={() => handleDeleteRow(variable.id)} />
                </tr>
              );
            })}

            {/* New */}
            {pending.map((row) => (
              <tr key={row.tmpId} className="border-t border-slate-100 bg-sky-50">

                {/* Alias */}
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW} placeholder="Alias *" value={row.name}
                    onChange={(e) => patchNewRow(row.tmpId, { name: e.target.value })} />
                </td>

                {/* Tipo */}
                <td className="px-3 py-1.5">
                  <select className={SELECT_NEW} value={row.datatype}
                    onChange={(e) => patchNewRow(row.tmpId, { datatype: e.target.value })}>
                    {DATATYPES.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
                  </select>
                </td>

                {/* Valor inicial */}
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW}
                    placeholder={row.datatype === "Bool" ? "true / false" : "0"}
                    value={row.initial_value}
                    onChange={(e) => patchNewRow(row.tmpId, { initial_value: e.target.value })} />
                </td>

                {/* Descripción */}
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW} placeholder="Para qué sirve esta variable…"
                    value={row.description}
                    onChange={(e) => patchNewRow(row.tmpId, { description: e.target.value })} />
                </td>

                <NewRowActionCell tmpId={row.tmpId}
                  onConfirm={() => handleCreateRow(row)}
                  onCancel={() => removeNewRow(row.tmpId)} />
              </tr>
            ))}

            {localVars.length === 0 && pending.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[12px] text-slate-400">
                  Sin variables locales. Usa "+ Añadir" para crear puntos de control para scripts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Shell ─────────────────────────────────────────────────────────────────────
  if (!open) return null;

  const tabBase = "px-4 py-2 text-[12px] font-medium border-b-2 transition-colors";
  const tabActive = "border-sky-500 text-sky-700 bg-white";
  const tabInactive = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";

  const countConn  = connectionVars.length;
  const countLocal = localVars.length;

  return (
    <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center">
      <div className="w-[1200px] max-w-[96vw] h-[680px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Variables del Proyecto</h2>
            {(loading || tagsLoading) && (
              <span className="text-[11px] text-slate-400">Cargando…</span>
            )}
            {!layoutId && (
              <span className="text-[11px] text-amber-600 font-medium">
                ⚠ Guarda el proyecto primero.
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setActiveTab("connection"); addNewRow("connection"); }}
              disabled={!layoutId}
              className="px-3 py-1 text-xs border border-slate-300 rounded hover:border-sky-400 hover:bg-sky-50 disabled:opacity-40"
            >
              + Añadir conexión
            </button>
            <button
              onClick={() => { setActiveTab("local"); addNewRow("local"); }}
              disabled={!layoutId}
              className="px-3 py-1 text-xs border border-slate-300 rounded hover:border-sky-400 hover:bg-sky-50 disabled:opacity-40"
            >
              + Añadir local
            </button>
            <button onClick={onClose} className="px-2 text-slate-500 hover:text-slate-800 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div className="flex items-center justify-between bg-rose-50 border-b border-rose-200 px-4 py-2 text-[11px] text-rose-700 shrink-0">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            className={cls(tabBase, activeTab === "connection" ? tabActive : tabInactive)}
            onClick={() => setActiveTab("connection")}
          >
            Conexión
            <span className={cls(
              "ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
              activeTab === "connection" ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-500"
            )}>
              {countConn}
            </span>
          </button>
          <button
            className={cls(tabBase, activeTab === "local" ? tabActive : tabInactive)}
            onClick={() => setActiveTab("local")}
          >
            Local
            <span className={cls(
              "ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
              activeTab === "local" ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-500"
            )}>
              {countLocal}
            </span>
          </button>

          {/* Descripción del tab activo */}
          <div className="ml-auto flex items-center pr-4 text-[10px] text-slate-400">
            {activeTab === "connection"
              ? "Variables vinculadas a tags del PLC. Tipo y dirección se auto-rellenan."
              : "Variables internas sin origen PLC. Úsalas como puntos de control en scripts."}
          </div>
        </div>

        {/* ── BODY ── */}
        {!layoutId ? (
          <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
            Sin proyecto activo. Guarda el proyecto primero.
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
            Cargando variables…
          </div>
        ) : (
          activeTab === "connection"
            ? renderConnectionTable()
            : renderLocalTable()
        )}

      </div>
    </div>
  );
};

export default ProjectVariableModal;
