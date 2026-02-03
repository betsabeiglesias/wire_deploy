import React, { useMemo, useState } from "react";

// Modal flotante para gestionar PLCs/tablas y tags de ejemplo (mock local).
const mockDevices = [
  {
    id: "cuba-1",
    name: "CUBA 1",
    tags: [{ id: "t1", name: "AI01", type: "Float", conn: "INTENANCE", plcName: "PLC1" }],
  },
  {
    id: "cuba-2",
    name: "CUBA 2",
    tags: [
      { id: "t2", name: "DB2.DBD00_FAST", type: "UInt32", conn: "INTENANCE", plcName: "PLC1" },
      { id: "t3", name: "T_CUBA2_FAST", type: "Float", conn: "INTENANCE", plcName: "PLC1" },
      { id: "t4", name: "DB2.DBD22_FAST", type: "Float", conn: "INTENANCE", plcName: "PLC1" },
    ],
  },
  { id: "general", name: "GENERAL", tags: [] },
];

const DeviceManagerModal = ({ open, onClose }) => {
  const [devices, setDevices] = useState(mockDevices);
  const [selectedId, setSelectedId] = useState(devices[0]?.id || null);

  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || { tags: [] },
    [devices, selectedId],
  );

  const addDevice = () => {
    const nextIndex = devices.length + 1;
    const newDevice = { id: `dev-${Date.now()}`, name: `Tabla ${nextIndex}`, tags: [] };
    setDevices((prev) => [...prev, newDevice]);
    setSelectedId(newDevice.id);
  };

  const renameDevice = (id) => {
    const current = devices.find((d) => d.id === id);
    const nextName = window.prompt("Nuevo nombre de tabla/PLC", current?.name || "");
    if (!nextName) return;
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, name: nextName } : d)));
  };

  const deleteDevice = (id) => {
    if (!window.confirm("¿Eliminar esta tabla/PLC y sus tags?")) return;
    setDevices((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
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
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedId
          ? {
              ...d,
              tags: [
                ...d.tags,
                {
                  id: `tmp-${Date.now()}`,
                  name: "NuevoTag",
                  type: "Float",
                  conn: "INTENANCE",
                  plcName: "PLC",
                },
              ],
            }
          : d,
      ),
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-[1200px] h-[620px] bg-slate-50 rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Dispositivos</h2>
            <div className="flex items-center gap-2">
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
              {devices.map((dev) => (
                <li
                  key={dev.id}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                    dev.id === selectedId ? "bg-sky-50 text-sky-800" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(dev.id)}
                >
                  <span className="text-slate-500">📄</span>
                  <div className="flex-1">
                    <div className="font-semibold text-xs">{dev.name}</div>
                    <div className="text-[11px] text-slate-500">{dev.tags.length} tags</div>
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
                <p className="text-sm font-semibold text-slate-800">{selected.name || "Selecciona un PLC"}</p>
                <p className="text-[11px] text-slate-500">Tags configurados: {selected.tags?.length || 0}</p>
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
                    <th className="px-3 py-2 text-left w-60">Name</th>
                    <th className="px-3 py-2 text-left w-28">Data type</th>
                    <th className="px-3 py-2 text-left w-32">Connection</th>
                    <th className="px-3 py-2 text-left w-32">PLC name</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.tags?.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-800">
                        <input
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-sky-400 focus:outline-none rounded px-1"
                          value={tag.name}
                          onChange={(e) =>
                            setDevices((prev) =>
                              prev.map((d) =>
                                d.id === selectedId
                                  ? {
                                      ...d,
                                      tags: d.tags.map((t) =>
                                        t.id === tag.id ? { ...t, name: e.target.value } : t,
                                      ),
                                    }
                                  : d,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <select
                          className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                          value={tag.type}
                          onChange={(e) =>
                            setDevices((prev) =>
                              prev.map((d) =>
                                d.id === selectedId
                                  ? {
                                      ...d,
                                      tags: d.tags.map((t) =>
                                        t.id === tag.id ? { ...t, type: e.target.value } : t,
                                      ),
                                    }
                                  : d,
                              ),
                            )
                          }
                        >
                          {["Float", "UInt32", "Int", "Bool", "String"].map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{tag.conn}</td>
                      <td className="px-3 py-2 text-slate-700">{tag.plcName}</td>
                      <td className="px-3 py-2 text-slate-500">
                        <input
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-sky-400 focus:outline-none rounded px-1"
                          placeholder="Notas"
                        />
                      </td>
                    </tr>
                  ))}
                  {!selected.tags?.length && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
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
