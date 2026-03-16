// src/modules/organizarScada/components/devices/ProjectVariableModal.jsx
//
// Gestor de variables con tablas intermedias.
// Estructura: Layout → VariableTable → ProjectVariable
//
// Panel izquierdo: lista de tablas del layout
//   - Botón "+ Nueva" → crea tabla
//   - Click en tabla → selecciona, muestra sus variables a la derecha
//   - Doble click en nombre → renombrar inline
//
// Panel derecho: variables de la tabla seleccionada
//   - Tabs Conexión / Local
//   - Selector de variable plano (sin filtro por equipo previo)
//   - Filas editables inline con borrador (draft)
//   - Nuevas filas en azul hasta confirmar con ✓
//
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useScadaConfig } from "../../../../context/ScadaConfigProvider";
import api from "../../../../services/api";

const DATATYPES = ["Float", "Bool", "Int", "String", "Double"];

// ── API ───────────────────────────────────────────────────────────────────────
const apiFetchTables = (lid)          => api.get(`/api/scada-manager/layouts/${lid}/tables/`).then(r => r.data);
const apiCreateTable = (lid, p)       => api.post(`/api/scada-manager/layouts/${lid}/tables/`, p).then(r => r.data);
const apiPatchTable  = (lid, tid, p)  => api.patch(`/api/scada-manager/layouts/${lid}/tables/${tid}/`, p).then(r => r.data);
const apiDeleteTable = (lid, tid)     => api.delete(`/api/scada-manager/layouts/${lid}/tables/${tid}/`);

const apiFetchVars  = (lid, tid)          => api.get(`/api/scada-manager/layouts/${lid}/tables/${tid}/variables/`).then(r => r.data);
const apiCreateVar  = (lid, tid, p)       => api.post(`/api/scada-manager/layouts/${lid}/tables/${tid}/variables/`, p).then(r => r.data);
const apiPatchVar   = (lid, tid, vid, p)  => api.patch(`/api/scada-manager/layouts/${lid}/tables/${tid}/variables/${vid}/`, p).then(r => r.data);
const apiDeleteVar  = (lid, tid, vid)     => api.delete(`/api/scada-manager/layouts/${lid}/tables/${tid}/variables/${vid}/`);

// ── Helpers ───────────────────────────────────────────────────────────────────
const cls       = (...p) => p.filter(Boolean).join(" ");
const INPUT     = "w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:border-sky-400 focus:outline-none bg-white";
const INPUT_NEW = "w-full rounded border border-sky-300 px-2 py-1 text-[11px] focus:border-sky-500 focus:outline-none bg-white";
const READONLY  = "text-[11px] text-slate-500 truncate";

// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectVariableModal({ open, onClose, layoutId }) {
  const { config, loading: tagsLoading } = useScadaConfig();

  const [tables,          setTables]          = useState([]);
  const [selectedTable,   setSelectedTable]   = useState(null);
  const [variables,       setVariables]       = useState([]);
  const [activeTab,       setActiveTab]       = useState("connection");

  const [loadingTables,   setLoadingTables]   = useState(false);
  const [loadingVars,     setLoadingVars]     = useState(false);
  const [saving,          setSaving]          = useState(null);
  const [error,           setError]           = useState(null);

  const [drafts,          setDrafts]          = useState({});
  const [newRows,         setNewRows]         = useState([]);
  const [renamingTableId, setRenamingTableId] = useState(null);
  const [renameValue,     setRenameValue]     = useState("");

  // ── Tag catalog ──────────────────────────────────────────────────────────
  const tagIndex = config?.tagIndex || {};

  const allTagOptions = useMemo(() =>
    Object.values(tagIndex)
      .map(tag => ({
        key:          `${tag.equipment}::${tag.variable}`,
        equipment:    tag.equipment  || "",
        variableName: tag.variable   || "",
        datatype:     tag.datatype   || "",
        unit:         tag.unit       || "",
        address:      typeof tag.address === "string" ? tag.address : tag.address?.value || "",
        nodeId:       tag.nodeId     || tag.node_id || "",
      }))
      .sort((a, b) => a.variableName.localeCompare(b.variableName)),
    [tagIndex]
  );

  // ── Load tables ──────────────────────────────────────────────────────────
  const loadTables = useCallback(async () => {
    if (!layoutId) return;
    setLoadingTables(true);
    try {
      const data = await apiFetchTables(layoutId);
      setTables(data);
      if (data.length > 0 && !selectedTable) setSelectedTable(data[0]);
    } catch {
      setError("No se pudieron cargar las tablas.");
    } finally {
      setLoadingTables(false);
    }
  }, [layoutId]);

  useEffect(() => {
    if (open && layoutId) {
      loadTables();
      setDrafts({});
      setNewRows([]);
      setError(null);
    }
  }, [open, layoutId]);

  // ── Load variables when table changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedTable || !layoutId) { setVariables([]); return; }
    setLoadingVars(true);
    setDrafts({});
    setNewRows([]);
    apiFetchVars(layoutId, selectedTable.id)
      .then(data => setVariables(data))
      .catch(() => setError("No se pudieron cargar las variables."))
      .finally(() => setLoadingVars(false));
  }, [selectedTable?.id, layoutId]);

  const connVars  = variables.filter(v => v.source === "connection");
  const localVars = variables.filter(v => v.source === "local");

  // ── Table operations ─────────────────────────────────────────────────────
  const handleCreateTable = async () => {
    const name = prompt("Nombre de la nueva tabla:");
    if (!name?.trim()) return;
    setSaving("new-table");
    try {
      const created = await apiCreateTable(layoutId, { name: name.trim() });
      setTables(prev => [...prev, created]);
      setSelectedTable(created);
    } catch {
      setError("Error al crear la tabla.");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!confirm(`¿Eliminar la tabla "${table.name}" y todas sus variables?`)) return;
    setSaving(`del-${table.id}`);
    try {
      await apiDeleteTable(layoutId, table.id);
      const remaining = tables.filter(t => t.id !== table.id);
      setTables(remaining);
      if (selectedTable?.id === table.id) setSelectedTable(remaining[0] || null);
    } catch {
      setError("Error al eliminar la tabla.");
    } finally {
      setSaving(null);
    }
  };

  const handleRenameTable = async (table) => {
    const name = renameValue.trim();
    if (!name || name === table.name) { setRenamingTableId(null); return; }
    try {
      const updated = await apiPatchTable(layoutId, table.id, { name });
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (selectedTable?.id === table.id) setSelectedTable(updated);
    } catch {
      setError("Error al renombrar la tabla.");
    } finally {
      setRenamingTableId(null);
    }
  };

  // ── Draft helpers ────────────────────────────────────────────────────────
  const getDraft    = (id, base) => (id in drafts ? { ...base, ...drafts[id] } : base);
  const patchDraft  = (id, p)    => setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...p } }));
  const discardDraft = (id)      => setDrafts(prev => { const n = { ...prev }; delete n[id]; return n; });

  // ── Save / delete existing variable ─────────────────────────────────────
  const handleSaveVar = async (variable) => {
    const draft = drafts[variable.id];
    if (!draft) return;
    setSaving(variable.id);
    try {
      const updated = await apiPatchVar(layoutId, selectedTable.id, variable.id, draft);
      setVariables(prev => prev.map(v => v.id === updated.id ? updated : v));
      discardDraft(variable.id);
    } catch {
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteVar = async (id) => {
    if (!confirm("¿Eliminar esta variable?")) return;
    setSaving(id);
    try {
      await apiDeleteVar(layoutId, selectedTable.id, id);
      setVariables(prev => prev.filter(v => v.id !== id));
      discardDraft(id);
    } catch {
      setError("Error al eliminar la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── New row helpers ──────────────────────────────────────────────────────
  const addNewRow   = (source) => setNewRows(prev => [...prev, {
    tmpId: `new-${Date.now()}`, source,
    name: "", equipment: "", variable: "", datatype: "Float",
    unit: "", address: "", nodeId: "", initial_value: "", description: "",
  }]);
  const patchNewRow  = (tmpId, p) => setNewRows(prev => prev.map(r => r.tmpId !== tmpId ? r : { ...r, ...p }));
  const removeNewRow = (tmpId)    => setNewRows(prev => prev.filter(r => r.tmpId !== tmpId));

  const handleCreateVar = async (row) => {
    if (!row.name.trim()) { setError("El alias no puede estar vacío."); return; }
    if (row.source === "connection" && (!row.equipment || !row.variable)) {
      setError("Selecciona una variable del sistema."); return;
    }
    setSaving(row.tmpId);
    setError(null);
    try {
      const created = await apiCreateVar(layoutId, selectedTable.id, {
        name:          row.name.trim(),
        source:        row.source,
        equipment:     row.source === "connection" ? row.equipment    : "",
        variable:      row.source === "connection" ? row.variable     : "",
        datatype:      row.datatype || "Float",
        unit:          row.unit     || "",
        address:       row.address  || "",
        node_id:       row.nodeId   || "",
        initial_value: row.source === "local" ? row.initial_value : null,
        description:   row.description || "",
      });
      setVariables(prev => [...prev, created]);
      removeNewRow(row.tmpId);
    } catch {
      setError("Error al crear la variable.");
    } finally {
      setSaving(null);
    }
  };

  // ── Cell components ──────────────────────────────────────────────────────
  const ActionCell = ({ id, isDirty, onSave, onDelete }) => (
    <td className="px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1">
        {isDirty && (
          <button type="button" disabled={saving === id} onClick={onSave}
            className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] text-white hover:bg-emerald-600 disabled:opacity-50">
            {saving === id ? "…" : "✓"}
          </button>
        )}
        <button type="button" disabled={saving === id} onClick={onDelete}
          className="text-rose-400 hover:text-rose-600 disabled:opacity-40 text-sm px-1">×</button>
      </div>
    </td>
  );

  const NewActionCell = ({ tmpId, onConfirm, onCancel }) => (
    <td className="px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1">
        <button type="button" disabled={saving === tmpId} onClick={onConfirm}
          className="rounded bg-sky-500 px-2 py-0.5 text-[10px] text-white hover:bg-sky-600 disabled:opacity-50">
          {saving === tmpId ? "…" : "✓"}
        </button>
        <button type="button" onClick={onCancel}
          className="text-rose-400 hover:text-rose-600 text-sm px-1">×</button>
      </div>
    </td>
  );

  // ── Connection table ─────────────────────────────────────────────────────
  const renderConnectionTable = () => {
    const pending = newRows.filter(r => r.source === "connection");
    const VarSelect = ({ value, onChange, cls: extraCls }) => (
      <select className={cls(INPUT, extraCls)} value={value} disabled={tagsLoading} onChange={onChange}>
        <option value="::">— selecciona variable —</option>
        {allTagOptions.map(t => (
          <option key={t.key} value={t.key}>
            {t.variableName} ({t.equipment})
          </option>
        ))}
      </select>
    );

    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-36">Alias</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">Variable del sistema</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-24">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-20">Unidad</th>
              <th className="px-3 py-2 border-b border-slate-200 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {connVars.map(variable => {
              const d       = getDraft(variable.id, variable);
              const isDirty = variable.id in drafts;
              const tagMeta = allTagOptions.find(t => t.equipment === d.equipment && t.variableName === d.variable);
              const selVal  = d.equipment && d.variable ? `${d.equipment}::${d.variable}` : "::";
              return (
                <tr key={variable.id}
                  className={cls("border-t border-slate-100", isDirty ? "bg-amber-50" : "hover:bg-slate-50")}>
                  <td className="px-3 py-1.5">
                    <input className={INPUT} value={d.name}
                      onChange={e => patchDraft(variable.id, { name: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <VarSelect value={selVal} onChange={e => {
                      const tag = allTagOptions.find(t => t.key === e.target.value);
                      if (!tag) return;
                      patchDraft(variable.id, {
                        equipment: tag.equipment, variable: tag.variableName,
                        datatype: tag.datatype, unit: tag.unit,
                        address: tag.address, node_id: tag.nodeId,
                      });
                    }} />
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{tagMeta?.datatype || d.datatype || "—"}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{tagMeta?.unit || d.unit || "—"}</span>
                  </td>
                  <ActionCell id={variable.id} isDirty={isDirty}
                    onSave={() => handleSaveVar(variable)}
                    onDelete={() => handleDeleteVar(variable.id)} />
                </tr>
              );
            })}

            {pending.map(row => {
              const tagMeta = allTagOptions.find(t => t.key === `${row.equipment}::${row.variable}`);
              return (
                <tr key={row.tmpId} className="border-t border-slate-100 bg-sky-50">
                  <td className="px-3 py-1.5">
                    <input className={INPUT_NEW} placeholder="Alias *" value={row.name}
                      onChange={e => patchNewRow(row.tmpId, { name: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <VarSelect cls={INPUT_NEW}
                      value={row.equipment && row.variable ? `${row.equipment}::${row.variable}` : "::"}
                      onChange={e => {
                        const tag = allTagOptions.find(t => t.key === e.target.value);
                        if (!tag) return;
                        patchNewRow(row.tmpId, {
                          equipment: tag.equipment, variable: tag.variableName,
                          datatype: tag.datatype, unit: tag.unit,
                          address: tag.address, nodeId: tag.nodeId,
                        });
                      }} />
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{tagMeta?.datatype || row.datatype || "—"}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={READONLY}>{tagMeta?.unit || row.unit || "—"}</span>
                  </td>
                  <NewActionCell tmpId={row.tmpId}
                    onConfirm={() => handleCreateVar(row)}
                    onCancel={() => removeNewRow(row.tmpId)} />
                </tr>
              );
            })}

            {connVars.length === 0 && pending.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-[12px] text-slate-400">
                Sin variables de conexión. Usa "+ Añadir conexión".
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Local table ──────────────────────────────────────────────────────────
  const renderLocalTable = () => {
    const pending = newRows.filter(r => r.source === "local");
    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-44">Alias</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-28">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 w-36">Valor inicial</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">Descripción</th>
              <th className="px-3 py-2 border-b border-slate-200 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {localVars.map(variable => {
              const d       = getDraft(variable.id, variable);
              const isDirty = variable.id in drafts;
              return (
                <tr key={variable.id}
                  className={cls("border-t border-slate-100", isDirty ? "bg-amber-50" : "hover:bg-slate-50")}>
                  <td className="px-3 py-1.5">
                    <input className={INPUT} value={d.name}
                      onChange={e => patchDraft(variable.id, { name: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <select className={INPUT} value={d.datatype || "Float"}
                      onChange={e => patchDraft(variable.id, { datatype: e.target.value })}>
                      {DATATYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input className={INPUT}
                      placeholder={d.datatype === "Bool" ? "true / false" : "0"}
                      value={d.initial_value ?? ""}
                      onChange={e => patchDraft(variable.id, { initial_value: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <input className={INPUT} placeholder="Para qué sirve…"
                      value={d.description ?? ""}
                      onChange={e => patchDraft(variable.id, { description: e.target.value })} />
                  </td>
                  <ActionCell id={variable.id} isDirty={isDirty}
                    onSave={() => handleSaveVar(variable)}
                    onDelete={() => handleDeleteVar(variable.id)} />
                </tr>
              );
            })}

            {pending.map(row => (
              <tr key={row.tmpId} className="border-t border-slate-100 bg-sky-50">
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW} placeholder="Alias *" value={row.name}
                    onChange={e => patchNewRow(row.tmpId, { name: e.target.value })} />
                </td>
                <td className="px-3 py-1.5">
                  <select className={INPUT_NEW} value={row.datatype}
                    onChange={e => patchNewRow(row.tmpId, { datatype: e.target.value })}>
                    {DATATYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                  </select>
                </td>
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW}
                    placeholder={row.datatype === "Bool" ? "true / false" : "0"}
                    value={row.initial_value}
                    onChange={e => patchNewRow(row.tmpId, { initial_value: e.target.value })} />
                </td>
                <td className="px-3 py-1.5">
                  <input className={INPUT_NEW} placeholder="Para qué sirve…"
                    value={row.description}
                    onChange={e => patchNewRow(row.tmpId, { description: e.target.value })} />
                </td>
                <NewActionCell tmpId={row.tmpId}
                  onConfirm={() => handleCreateVar(row)}
                  onCancel={() => removeNewRow(row.tmpId)} />
              </tr>
            ))}

            {localVars.length === 0 && pending.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-[12px] text-slate-400">
                Sin variables locales. Usa "+ Añadir local".
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Shell ────────────────────────────────────────────────────────────────
  if (!open) return null;

  const tabBase     = "px-4 py-2 text-[12px] font-medium border-b-2 transition-colors";
  const tabActive   = "border-sky-500 text-sky-700 bg-white";
  const tabInactive = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";

  return (
    <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center">
      <div className="w-[1200px] max-w-[96vw] h-[680px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">Variables del Proyecto</h2>
          <div className="flex gap-2 items-center">
            {selectedTable && (
              <>
                <button onClick={() => { setActiveTab("connection"); addNewRow("connection"); }}
                  className="px-3 py-1 text-xs border border-slate-300 rounded hover:border-sky-400 hover:bg-sky-50">
                  + Añadir conexión
                </button>
                <button onClick={() => { setActiveTab("local"); addNewRow("local"); }}
                  className="px-3 py-1 text-xs border border-slate-300 rounded hover:border-sky-400 hover:bg-sky-50">
                  + Añadir local
                </button>
              </>
            )}
            <button onClick={onClose} className="px-2 text-slate-500 hover:text-slate-800 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center justify-between bg-rose-50 border-b border-rose-200 px-4 py-2 text-[11px] text-rose-700 shrink-0">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">

          {/* PANEL IZQUIERDO — tablas */}
          <div className="w-52 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tablas</p>
              <button onClick={handleCreateTable}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-medium">
                + Nueva
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingTables && (
                <div className="px-3 py-3 text-[11px] text-slate-400">Cargando…</div>
              )}
              {!loadingTables && tables.length === 0 && (
                <div className="px-3 py-4 text-[11px] text-slate-400">
                  Sin tablas. Crea una con "+ Nueva".
                </div>
              )}
              {tables.map(table => (
                <div key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={cls(
                    "group flex items-center justify-between px-3 py-2 cursor-pointer text-[12px] border-b border-slate-100",
                    selectedTable?.id === table.id
                      ? "bg-sky-50 text-sky-800 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}>
                  {renamingTableId === table.id ? (
                    <input autoFocus
                      className="flex-1 rounded border border-sky-300 px-1 py-0.5 text-[12px] focus:outline-none"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameTable(table)}
                      onKeyDown={e => {
                        if (e.key === "Enter")  handleRenameTable(table);
                        if (e.key === "Escape") setRenamingTableId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate"
                      onDoubleClick={e => {
                        e.stopPropagation();
                        setRenamingTableId(table.id);
                        setRenameValue(table.name);
                      }}>
                      {table.name}
                    </span>
                  )}
                  <span className="shrink-0 text-[10px] text-slate-400 ml-1">
                    {table.variable_count ?? table.variables?.length ?? 0}
                  </span>
                  <button type="button"
                    onClick={e => { e.stopPropagation(); handleDeleteTable(table); }}
                    className="ml-1 hidden group-hover:inline text-rose-400 hover:text-rose-600 text-xs">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DERECHO — variables */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedTable ? (
              <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
                Selecciona o crea una tabla.
              </div>
            ) : (
              <>
                <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
                  <button className={cls(tabBase, activeTab === "connection" ? tabActive : tabInactive)}
                    onClick={() => setActiveTab("connection")}>
                    Conexión
                    <span className={cls("ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
                      activeTab === "connection" ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-500")}>
                      {connVars.length}
                    </span>
                  </button>
                  <button className={cls(tabBase, activeTab === "local" ? tabActive : tabInactive)}
                    onClick={() => setActiveTab("local")}>
                    Local
                    <span className={cls("ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
                      activeTab === "local" ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-500")}>
                      {localVars.length}
                    </span>
                  </button>
                  <div className="ml-auto flex items-center pr-4 text-[10px] text-slate-400">
                    Tabla: <span className="ml-1 font-medium text-slate-600">{selectedTable.name}</span>
                    <span className="ml-2 text-slate-300">· doble clic para renombrar</span>
                  </div>
                </div>

                {loadingVars ? (
                  <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
                    Cargando variables…
                  </div>
                ) : (
                  activeTab === "connection" ? renderConnectionTable() : renderLocalTable()
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
