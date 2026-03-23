// src/modules/organizarScada/components/sidebar/DeviceManagerModal.jsx
//
// Gestor de tablas/grupos de tags del proyecto.
// - Tags disponibles vienen de useScadaConfig (API REST), no del WebSocket.
// - Los grupos y su contenido se persisten en localStorage como preferencia
//   de organización del diseñador. No son fuente de datos en tiempo real.
//
import React, { useEffect, useMemo, useState } from "react";
import { useScadaConfig } from "../../../../context/ScadaConfigProvider";

const DEVICES_STORAGE_KEY = "organizarScada.devices.tables";

const loadDevicesFromStorage = () => {
  try {
    const raw = localStorage.getItem(DEVICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const DeviceManagerModal = ({ open, onClose }) => {
  const { config, loading } = useScadaConfig();

  const [devices,          setDevices]          = useState(loadDevicesFromStorage);
  const [selectedId,       setSelectedId]       = useState(null);
  const [hasUnsavedChanges,setHasUnsavedChanges]= useState(false);

  // ── Tags de la API ──────────────────────────────────────────────────────────
  // config.tagIndex: { "equipment.variable": { equipment, variable, datatype, unit, ... } }
  const tagIndex = config?.tagIndex || {};

  const variablesByEquipment = useMemo(() => {
    const map = {};
    Object.values(tagIndex).forEach(tag => {
      const eq = tag.equipment;
      if (!eq) return;
      if (!map[eq]) map[eq] = [];
      map[eq].push({
        key:          `${eq}::${tag.variable}`,
        variableName: tag.variable,
        datatype:     tag.datatype  || "",
        unit:         tag.unit      || "",
      });
    });
    return map;
  }, [tagIndex]);

  const equipmentOptions = useMemo(() =>
    Object.keys(variablesByEquipment)
      .sort()
      .map(eq => ({ value: eq, label: eq })),
    [variablesByEquipment]
  );

  // ── Selección de tabla ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!devices.length) { setSelectedId(null); return; }
    if (!selectedId || !devices.some(d => d.id === selectedId)) {
      setSelectedId(devices[0].id);
    }
  }, [devices, selectedId]);

  const selected = useMemo(
    () => devices.find(d => d.id === selectedId) || { tags: [] },
    [devices, selectedId]
  );

  // ── Mutaciones ──────────────────────────────────────────────────────────────
  const updateCurrentTag = (tagId, updater) => {
    setDevices(prev =>
      prev.map(d =>
        d.id !== selectedId ? d : {
          ...d,
          tags: d.tags.map(t =>
            t.id !== tagId ? t :
            typeof updater === "function" ? updater(t) : { ...t, ...updater }
          ),
        }
      )
    );
    setHasUnsavedChanges(true);
  };

  const addDevice = () => {
    const newDevice = { id: `dev-${Date.now()}`, name: "Nueva tabla", tags: [] };
    setDevices(prev => [...prev, newDevice]);
    setSelectedId(newDevice.id);
    setHasUnsavedChanges(true);
  };

  const deleteDevice = (id) => {
    if (!confirm("¿Eliminar esta tabla?")) return;
    setDevices(prev => prev.filter(d => d.id !== id));
    setHasUnsavedChanges(true);
  };

  const renameDevice = (id, name) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    setHasUnsavedChanges(true);
  };

  const addEmptyTag = () => {
    if (!selectedId) return;
    const tag = {
      id:           `tmp-${Date.now()}`,
      name:         "NuevoTag",
      equipment:    "",
      variableName: "",
      datatype:     "Float",
      unit:         "",
    };
    setDevices(prev =>
      prev.map(d => d.id === selectedId ? { ...d, tags: [...d.tags, tag] } : d)
    );
    setHasUnsavedChanges(true);
  };

  const removeTag = (tagId) => {
    setDevices(prev =>
      prev.map(d =>
        d.id !== selectedId ? d : { ...d, tags: d.tags.filter(t => t.id !== tagId) }
      )
    );
    setHasUnsavedChanges(true);
  };

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
    setHasUnsavedChanges(false);
    onClose?.();
  };

  const handleClose = () => {
    if (hasUnsavedChanges && !confirm("Hay cambios sin guardar. ¿Salir sin guardar?")) return;
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center">
      <div className="w-[1200px] h-[700px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Dispositivos</h2>
            {loading && (
              <span className="text-[11px] text-slate-400">Cargando tags de la API…</span>
            )}
            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-600 font-medium">● Sin guardar</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              Guardar
            </button>
            <button
              onClick={addDevice}
              className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
            >
              + Tabla
            </button>
            <button onClick={handleClose} className="px-2 text-slate-500 hover:text-slate-800">
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">

          {/* LISTA TABLAS */}
          <div className="w-60 border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="px-2 py-2 border-b border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Tablas
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {devices.length === 0 && (
                <div className="px-3 py-4 text-[11px] text-slate-400">
                  Sin tablas. Usa "+ Tabla".
                </div>
              )}
              {devices.map(dev => (
                <div
                  key={dev.id}
                  onClick={() => setSelectedId(dev.id)}
                  className={[
                    "group flex items-center justify-between px-3 py-2 cursor-pointer text-[12px]",
                    dev.id === selectedId
                      ? "bg-sky-100 text-sky-800 font-semibold"
                      : "hover:bg-slate-50 text-slate-700",
                  ].join(" ")}
                >
                  <span className="flex-1 truncate">{dev.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {dev.tags?.length || 0}
                  </span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); deleteDevice(dev.id); }}
                    className="ml-1 hidden group-hover:inline text-rose-400 hover:text-rose-600 text-xs"
                    title="Eliminar tabla"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TABLA TAGS */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
                Selecciona o crea una tabla.
              </div>
            ) : (
              <>
                {/* Nombre tabla + botón añadir */}
                <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50">
                  <input
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-[12px] font-semibold focus:border-sky-400 focus:outline-none"
                    value={selected.name || ""}
                    onChange={e => renameDevice(selectedId, e.target.value)}
                    placeholder="Nombre de la tabla"
                  />
                  <button
                    onClick={addEmptyTag}
                    className="shrink-0 text-xs border border-slate-300 px-3 py-1 rounded hover:border-sky-400 hover:bg-sky-50"
                  >
                    + Añadir tag
                  </button>
                </div>

                <div className="flex-1 overflow-auto">
                  {selected.tags?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[12px] text-slate-400">
                      Sin tags. Usa "+ Añadir tag".
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          <th className="p-2 text-left font-semibold text-slate-600 w-40">Alias</th>
                          <th className="p-2 text-left font-semibold text-slate-600">Equipo</th>
                          <th className="p-2 text-left font-semibold text-slate-600">Variable</th>
                          <th className="p-2 text-left font-semibold text-slate-600 w-20">Tipo</th>
                          <th className="p-2 text-left font-semibold text-slate-600 w-14">Unidad</th>
                          <th className="p-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.tags.map(tag => {
                          const equipmentVariables = variablesByEquipment[tag.equipment] || [];
                          const varMeta = equipmentVariables.find(v => v.variableName === tag.variableName);
                          return (
                            <tr key={tag.id} className="border-t border-slate-100 hover:bg-slate-50">
                              {/* Alias */}
                              <td className="p-2">
                                <input
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:border-sky-400 focus:outline-none"
                                  value={tag.name}
                                  onChange={e => updateCurrentTag(tag.id, { name: e.target.value })}
                                />
                              </td>

                              {/* Equipo */}
                              <td className="p-2">
                                <select
                                  className="w-full rounded border border-slate-200 px-1 py-1 text-[11px] focus:border-sky-400 focus:outline-none"
                                  value={tag.equipment}
                                  onChange={e =>
                                    updateCurrentTag(tag.id, {
                                      equipment:    e.target.value,
                                      variableName: "",
                                      datatype:     "Float",
                                      unit:         "",
                                    })
                                  }
                                >
                                  <option value="">Selecciona equipo</option>
                                  {loading
                                    ? <option disabled>Cargando…</option>
                                    : equipmentOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))
                                  }
                                </select>
                              </td>

                              {/* Variable */}
                              <td className="p-2">
                                <select
                                  className="w-full rounded border border-slate-200 px-1 py-1 text-[11px] focus:border-sky-400 focus:outline-none"
                                  value={tag.variableName}
                                  disabled={!tag.equipment}
                                  onChange={e => {
                                    const v = equipmentVariables.find(x => x.variableName === e.target.value);
                                    updateCurrentTag(tag.id, {
                                      variableName: e.target.value,
                                      datatype:     v?.datatype || "Float",
                                      unit:         v?.unit     || "",
                                    });
                                  }}
                                >
                                  <option value="">Variable</option>
                                  {equipmentVariables.map(v => (
                                    <option key={v.key} value={v.variableName}>
                                      {v.variableName}{v.unit ? ` [${v.unit}]` : ""}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Tipo — auto-rellenado */}
                              <td className="p-2 text-slate-500">
                                {varMeta?.datatype || tag.datatype || "—"}
                              </td>

                              {/* Unidad — auto-rellenada */}
                              <td className="p-2 text-slate-500">
                                {varMeta?.unit || tag.unit || "—"}
                              </td>

                              {/* Borrar */}
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag.id)}
                                  className="text-rose-400 hover:text-rose-600"
                                  title="Eliminar tag"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagerModal;
