import React, { useEffect, useMemo, useState } from "react";
import { getPLC, getPLCs } from "@/modules/scada/api/plcApi";
import { useRealtime } from "@/realtime/RealtimeProvider";

// Modal flotante para gestionar PLCs/tablas y tags de ejemplo (mock local).
// Arrancamos vacío para que el usuario cree sus propias tablas/PLC
const mockDevices = [];
const DEVICES_STORAGE_KEY = "organizarScada.devices.tables";

const loadDevicesFromStorage = () => {
  try {
    const raw = localStorage.getItem(DEVICES_STORAGE_KEY);
    if (!raw) return mockDevices;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : mockDevices;
  } catch (_err) {
    return mockDevices;
  }
};

const DeviceManagerModal = ({ open, onClose }) => {
  const [devices, setDevices] = useState(loadDevicesFromStorage);
  const [selectedId, setSelectedId] = useState(null);
  const [apiDevices, setApiDevices] = useState([]);
  const realtime = useRealtime();
  const allTags = realtime?.allTags || [];

  useEffect(() => {
    let cancelled = false;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.results)) return payload.results;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      return [];
    };

    const pickPlcId = (plc) =>
      plc?.id ?? plc?.pk ?? plc?.uuid ?? plc?.plc_id ?? null;

    const extractRows = (plc, basePlc) => {
      const a =
        plc?.items ||
        plc?.tags ||
        plc?.variables ||
        plc?.config?.items ||
        plc?.config?.tags ||
        plc?.config?.variables ||
        [];
      if (Array.isArray(a) && a.length) return a;
      const b =
        basePlc?.items ||
        basePlc?.tags ||
        basePlc?.variables ||
        basePlc?.config?.items ||
        basePlc?.config?.tags ||
        basePlc?.config?.variables ||
        [];
      return Array.isArray(b) ? b : [];
    };

    const loadDevicesFromApi = async () => {
      try {
        const plcsRaw = await getPLCs();
        if (cancelled) return;
        const plcList = toArray(plcsRaw);

        const detailResults = await Promise.allSettled(
          plcList.map((plc) => {
            const plcId = pickPlcId(plc);
            return plcId ? getPLC(plcId) : Promise.resolve(plc);
          }),
        );
        if (cancelled) return;

        const normalizedDevices = [];
        detailResults.forEach((result, index) => {
          const basePlc = plcList[index] || {};
          const plc =
            result.status === "fulfilled" && result.value
              ? result.value
              : basePlc;
          const plcId = pickPlcId(plc) ?? pickPlcId(basePlc) ?? `plc-${index}`;
          const equipmentId =
            plc?.equipment_id || basePlc?.equipment_id || plc?.name || "";
          const endpoint =
            plc?.connection?.endpoint ||
            plc?.config?.connection?.endpoint ||
            basePlc?.connection?.endpoint ||
            basePlc?.config?.connection?.endpoint ||
            "";
          const driver = plc?.driver || basePlc?.driver || "";
          const sourceRows = extractRows(plc, basePlc);
          const normalizedTags = sourceRows.map((tag, tagIdx) => ({
            id: tag?.id || `${plcId}-${tagIdx}`,
            name:
              tag?.name ||
              tag?.variable ||
              tag?.tag ||
              tag?.cdc?.tag ||
              tag?.attributeKey ||
              `var_${tagIdx + 1}`,
            variable:
              tag?.variable ||
              tag?.name ||
              tag?.tag ||
              tag?.cdc?.tag ||
              tag?.attributeKey ||
              "",
            address: endpoint,
            nodeId:
              tag?.node_id ||
              tag?.nodeId ||
              tag?.addressing?.node_id ||
              "",
            node_id:
              tag?.node_id ||
              tag?.nodeId ||
              tag?.addressing?.node_id ||
              "",
            datatype: tag?.datatype || tag?.type || "Float",
            unit: tag?.unit || tag?.cdc?.unit || "",
          }));

          normalizedDevices.push({
            id: String(plcId),
            name: plc?.name || basePlc?.name || equipmentId || `PLC ${index + 1}`,
            equipmentId,
            driver,
            endpoint,
            tags: normalizedTags,
          });
        });

        if (!cancelled) setApiDevices(normalizedDevices);
      } catch (_err) {
        if (!cancelled) setApiDevices([]);
      }
    };

    loadDevicesFromApi();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!devices.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !devices.some((d) => d.id === selectedId)) {
      setSelectedId(devices[0].id);
    }
  }, [devices, selectedId]);

  const selected = useMemo(
    () => devices.find(d => d.id === selectedId) || { tags: [] },
    [devices, selectedId],
  );

  const apiVariableOptions = useMemo(() => {
    const options = [];
    const seen = new Set();
    apiDevices.forEach((dev) => {
      (dev.tags || []).forEach((t) => {
        if (!t?.name) return;
        const key = `${dev.id}::${t.name}`;
        if (seen.has(key)) return;
        seen.add(key);
        options.push({
          key,
          deviceId: dev.id,
          variableName: t.name,
          label: `${dev.equipmentId || dev.name}/${t.name}`,
          datatype: t.datatype || "Float",
          driver: dev.driver || "",
          endpoint: dev.endpoint || "",
          nodeId: t.nodeId || "",
          equipmentId: dev.equipmentId || "",
          unit: t.unit || "",
        });
      });
    });
    return options.sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  }, [apiDevices]);

  const realtimeVariableOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    allTags.forEach((t) => {
      const variable = t?.variable;
      if (!variable) return;
      const equipmentId = t?.equipment_id || t?.equipment || "";
      const key = `rt::${equipmentId}::${variable}`;
      if (seen.has(key)) return;
      seen.add(key);
        options.push({
          key,
          source: "realtime",
          deviceId: "",
        variableName: variable,
        label: `${equipmentId || "equipo"}/${variable}`,
        datatype: "Float",
        driver: t?.source?.driver || "",
          endpoint: t?.source?.endpoint || "",
          nodeId: t?.source?.node_id || "",
          node_id: t?.source?.node_id || "",
          equipmentId,
          unit: t?.unit || "",
        });
    });
    return options.sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  }, [allTags]);

  const selectorVariableOptions = useMemo(() => {
    const merged = [];
    const seenLabel = new Set();
    [...apiVariableOptions, ...realtimeVariableOptions].forEach((opt) => {
      if (seenLabel.has(opt.label)) return;
      seenLabel.add(opt.label);
      merged.push(opt);
    });
    return merged;
  }, [apiVariableOptions, realtimeVariableOptions]);

  const updateCurrentTag = (tagId, updater) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedId
          ? {
              ...d,
              tags: d.tags.map((t) => {
                if (t.id !== tagId) return t;
                return typeof updater === "function"
                  ? updater(t)
                  : { ...t, ...updater };
              }),
            }
          : d,
      ),
    );
  };

  const addDevice = () => {
    const nextIndex = devices.length + 1;
    const newDevice = {
      id: `dev-${Date.now()}`,
      name: `Tabla ${nextIndex}`,
      tags: [],
    };
    setDevices(prev => [...prev, newDevice]);
    setSelectedId(newDevice.id);
  };

  const renameDevice = id => {
    const current = devices.find(d => d.id === id);
    const nextName = window.prompt(
      "Nuevo nombre de tabla/PLC",
      current?.name || "",
    );
    if (!nextName) return;
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, name: nextName } : d)),
    );
  };

  const deleteDevice = id => {
    if (!window.confirm("¿Eliminar esta tabla/PLC y sus tags?")) return;
    setDevices(prev => {
      const filtered = prev.filter(d => d.id !== id);
      // Reasignar selección
      if (id === selectedId) {
        const next = filtered[0]?.id || null;
        setSelectedId(next);
      }
      return filtered;
    });
  };

  const addEmptyTag = () => {
    if (!selectedId) return;
    setDevices(prev =>
      prev.map(d =>
        d.id === selectedId
          ? {
              ...d,
              tags: [
                ...d.tags,
                {
                  id: `tmp-${Date.now()}`,
                  name: "NuevoTag",
                  sourceMode: "local",
                  type: "Float",
                  variableName: "",
                  deviceId: "",
                  address: "",
                  nodeId: "",
                  initialValue: "",
                  conn: "Local",
                  plcName: "",
                  equipment: "",
                  unit: "",
                  notes: "",
                  plcVariable: "",
                  bindingKey: "",
                },
              ],
            }
          : d,
      ),
    );
  };

  const handleSaveDevices = () => {
    try {
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
      window.alert("Guardado con exito.");
    } catch (_err) {
      window.alert("No se pudo guardar en localStorage.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-[1200px] h-[620px] bg-slate-50 rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Dispositivos
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDevices}
                className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:border-emerald-400"
              >
                Guardar
              </button>
              <button
                onClick={addDevice}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
              >
                + Nueva tabla/PLC
              </button>
              <button
                onClick={() => renameDevice(selectedId)}
                disabled={!selectedId}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50 disabled:opacity-50"
              >
                Renombrar
              </button>
              <button
                onClick={() => deleteDevice(selectedId)}
                disabled={!selectedId}
                className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo (árbol/lista) */}
          <div className="w-72 border-r border-slate-200 bg-white overflow-y-auto">
            <div className="px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-slate-500 border-b border-slate-100">
              Tablas / PLC
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {devices.map(dev => (
                <li
                  key={dev.id}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                    dev.id === selectedId
                      ? "bg-sky-50 text-sky-800"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(dev.id)}
                >
                  <span className="text-slate-500">📄</span>
                  <div className="flex-1">
                    <div className="font-semibold text-xs">{dev.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {dev.tags.length} tags
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* se eliminan acciones duplicadas de pie; ahora están en el header */}
          </div>

          {/* Panel derecho (tabla de tags) */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selected.name || "Selecciona un PLC"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tags configurados: {selected.tags?.length || 0}
                </p>
              </div>
              <button
                onClick={addEmptyTag}
                className="rounded border border-sky-300 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:border-sky-400"
              >
                + Añadir tag
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="min-w-full text-[12px]">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.08em]">
                  <tr>
                    <th className="px-3 py-2 text-left w-48">Nombre</th>
                    <th className="px-3 py-2 text-left w-36">Local/Conexion</th>
                    <th className="px-3 py-2 text-left w-40">Nombre variable</th>
                    <th className="px-3 py-2 text-left w-28">Tipo de variable</th>
                    <th className="px-3 py-2 text-left w-44">Dispositivo</th>
                    <th className="px-3 py-2 text-left w-44">Direccion</th>
                    <th className="px-3 py-2 text-left w-44">Nodo</th>
                    <th className="px-3 py-2 text-left w-40">Valor inicial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.tags?.map((tag) => {
                    const mode =
                      tag.sourceMode ||
                      (tag.deviceId || tag.plcVariable || tag.address || tag.nodeId
                        ? "conexion"
                        : "local");
                    const isLocal = mode === "local";
                    const selectedAttr =
                      selectorVariableOptions.find(
                        (opt) =>
                          opt.key ===
                          (tag.bindingKey ||
                            (tag.deviceId && tag.variableName
                              ? `${tag.deviceId}::${tag.variableName}`
                              : "")),
                      ) || null;

                    return (
                      <tr key={tag.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-800">
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-sky-400 focus:outline-none rounded px-1"
                            value={tag.name}
                            onChange={(e) =>
                              updateCurrentTag(tag.id, { name: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <select
                            className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                            value={mode}
                            onChange={(e) => {
                              const nextMode = e.target.value;
                              if (nextMode === "local") {
                                updateCurrentTag(tag.id, {
                                  sourceMode: "local",
                                  conn: "Local",
                                  variableName: "",
                                  deviceId: "",
                                  address: "",
                                  nodeId: "",
                                  plcVariable: "",
                                  bindingKey: "",
                                  equipment: "",
                                  plcName: "",
                                  unit: "",
                                });
                                return;
                              }
                              updateCurrentTag(tag.id, {
                                sourceMode: "conexion",
                                conn: "Conexion",
                                initialValue: "",
                              });
                            }}
                          >
                            <option value="local">Local</option>
                            <option value="conexion">Conexion</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <span>{tag.variableName || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <select
                              className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                              value={tag.type}
                              onChange={(e) =>
                                updateCurrentTag(tag.id, { type: e.target.value })
                              }
                            >
                              {["Float", "UInt32", "Int", "Bool", "String"].map(
                                (opt) => (
                                  <option key={opt}>{opt}</option>
                                ),
                              )}
                            </select>
                          ) : (
                            <span>{tag.type || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <select
                              className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                              value={selectedAttr?.key || ""}
                              onChange={(e) => {
                                const picked =
                                  selectorVariableOptions.find(
                                    (opt) => opt.key === e.target.value,
                                  ) || null;
                                updateCurrentTag(tag.id, {
                                  sourceMode: "conexion",
                                  conn: "Conexion",
                                  bindingKey: picked?.key || "",
                                  variableName: picked?.variableName || "",
                                  plcVariable: picked?.variableName || "",
                                  deviceId: picked?.deviceId || "",
                                  plcName: picked?.driver || "",
                                  type: picked?.datatype || tag.type || "Float",
                                  address: picked?.endpoint || "",
                                  nodeId: picked?.nodeId || "",
                                  node_id: picked?.node_id || picked?.nodeId || "",
                                  equipment: picked?.equipmentId || "",
                                  unit: picked?.unit || "",
                                  initialValue: "",
                                });
                              }}
                            >
                              <option value="">
                                {selectorVariableOptions.length
                                  ? "Selecciona atributo"
                                  : "Sin variables API"}
                              </option>
                              {selectorVariableOptions.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <span>{tag.address || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <span>{tag.node_id || tag.nodeId || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <input
                              className="w-full bg-transparent border border-slate-200 rounded px-1"
                              placeholder="Valor inicial"
                              value={tag.initialValue ?? ""}
                              onChange={(e) =>
                                updateCurrentTag(tag.id, {
                                  initialValue: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!selected.tags?.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-4 text-center text-slate-500"
                      >
                        No hay tags. Usa “+ Añadir tag”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagerModal;
