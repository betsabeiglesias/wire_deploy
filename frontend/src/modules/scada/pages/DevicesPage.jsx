// frontend/src/modules/scada/pages/DevicesPage.jsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPLCs, deletePLC, togglePLC } from "../api/plcApi";
import { useRealtimeData } from "../../../hooks/useRealtimeData";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, Search, Activity, CheckCircle2, XCircle, Clock, WifiOff } from "lucide-react";

const statusConfig = {
  connected:         { label: "Conectado",       cls: "bg-[#EDF8EF] text-[#2A8B4B]",  icon: CheckCircle2 },
  stale:             { label: "Desactualizado",  cls: "bg-[#FFF8EC] text-[#B45309]",  icon: Clock },
  pending:           { label: "Pendiente",        cls: "bg-[#F2F3F5] text-[#565C6B]",  icon: Activity },
  disabled:          { label: "Deshabilitado",    cls: "bg-[#F2F3F5] text-[#565C6B]",  icon: XCircle },
  "gateway-offline": { label: "Gateway Offline",  cls: "bg-[#FEF2F2] text-[#DC2626]",  icon: WifiOff },
};

const resolveDriverName = (plc) => {
  const numericDriverMap = { 1: "snap7", 2: "opcua", 3: "modbus" };
  if (typeof plc?.driver === "number") return numericDriverMap[plc.driver] || null;
  const candidates = [plc?.driver_code, plc?.driver_name, plc?.driver]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase().replaceAll(" ", "").replaceAll("-", ""));
  if (candidates.some((v) => v.includes("snap7") || v.includes("siemens"))) return "snap7";
  if (candidates.some((v) => v.includes("opcua") || v.includes("opc"))) return "opcua";
  if (candidates.some((v) => v.includes("modbus"))) return "modbus";
  return null;
};

const DevicesPage = () => {
  const navigate = useNavigate();
  const gateway  = useRealtimeData();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPLCs();
        setDevices(data);
      } catch (err) {
        console.error("Error loading PLC list:", err);
        Swal.fire({ icon: "error", title: "Error loading devices", text: err.message || "Could not load devices" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar dispositivo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await deletePLC(id);
      setDevices((prev) => prev.filter((plc) => plc.id !== id));
      Swal.fire({ icon: "success", title: "Dispositivo eliminado", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al eliminar", text: err.message || "No se pudo eliminar el dispositivo" });
    }
  };

  const handleToggle = async (plc) => {
    try {
      const updated = await togglePLC(plc.id, !plc.enabled);
      setDevices((prev) => prev.map((d) => (d.id === plc.id ? updated : d)));
      Swal.fire({ icon: "info", title: plc.enabled ? "PLC deshabilitado" : "PLC habilitado", text: "Los cambios se aplicarán automáticamente.", timer: 2000, showConfirmButton: false, toast: true, position: "top-end" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo cambiar el estado del dispositivo" });
    }
  };

  const handleEdit = (plc) => {
    const driverName = resolveDriverName(plc);
    if (!driverName) {
      Swal.fire({ icon: "error", title: "Driver no soportado", text: "No se puede editar este tipo de dispositivo" });
      return;
    }
    navigate(`/devices/edit/${driverName}/${plc.id}`, { state: { plc } });
  };

  const computeStatus = (plc, mqttData) => {
    if (!plc.enabled) return "disabled";
    if (!mqttData.connected) return "gateway-offline";
    const plcTags = plc.tags || [];
    if (plcTags.length === 0) return "connected";
    const hasData = mqttData.allTags.some((t) => t.equipment_id === plc.equipment_id);
    if (hasData && !mqttData.dataStale) return "connected";
    if (hasData && mqttData.dataStale) return "stale";
    return "pending";
  };

  const devicesWithStatus = useMemo(
    () => devices.map((plc) => ({ ...plc, status: computeStatus(plc, gateway) })),
    [devices, gateway]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return devicesWithStatus;
    const q = search.toLowerCase();
    return devicesWithStatus.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.driver_name?.toLowerCase().includes(q) ||
        d.connection_string?.toLowerCase().includes(q) ||
        d.work_unit_detail?.name?.toLowerCase().includes(q)
    );
  }, [devicesWithStatus, search]);

  const totals = useMemo(() => ({
    total:      devices.length,
    enabled:    devices.filter((d) => d.enabled).length,
    connected:  devicesWithStatus.filter((d) => d.status === "connected").length,
  }), [devices, devicesWithStatus]);

  const goToPLC = (id) => navigate(`/devices/${id}`);

  // ── Clases reutilizables ────────────────────────────────────────────
  const btnPrimary = "inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium bg-[#29468B] text-white rounded-[4px] hover:bg-[#1F3A73] transition-colors";
  const btnSecondary = "inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium border border-slate-300 bg-white text-slate-700 rounded-[4px] hover:border-slate-400 transition-colors";
  const btnDanger = "inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] rounded-[4px] hover:brightness-95 transition-colors";

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* ── Header de página ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Dispositivos PLC
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 italic hidden lg:block">
            Los cambios se sincronizan automáticamente con el gateway.
          </span>
          <button onClick={() => navigate("/devices/new")} className={btnPrimary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo dispositivo
          </button>
        </div>
      </div>

      {/* ── KPI summary + buscador ───────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F9F9FA] border-b border-slate-200">
        {/* KPI chips */}
        <div className="flex gap-2 mr-3">
          {[
            { label: "Total",      value: totals.total,     cls: "text-slate-700" },
            { label: "Habilitados", value: totals.enabled,  cls: "text-[#29468B]" },
            { label: "Conectados", value: totals.connected, cls: "text-[#2A8B4B]" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex flex-col items-center px-3 py-1 rounded-[4px] border border-slate-200 bg-white min-w-[60px]">
              <span className={`text-[18px] font-semibold ${cls}`}>{value}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.05em]">{label}</span>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, driver, IP..."
            className="h-8 w-full pl-8 pr-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 transition-colors"
          />
        </div>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center gap-3 h-40">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#29468B]" />
            <p className="text-[12px] text-slate-500">Cargando dispositivos...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 h-48 border-2 border-dashed border-slate-200 rounded-[6px] bg-white">
            <p className="text-[12px] text-slate-400">No hay dispositivos configurados</p>
            <button onClick={() => navigate("/devices/new")} className={btnPrimary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear primer dispositivo
            </button>
          </div>
        ) : (
          <div className="rounded-[4px] border border-slate-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#EEF2F8] border-b border-slate-200">
                  {["Nombre", "Driver", "Unidad de trabajo", "Dirección IP", "Estado", "Habilitado", "Acciones"].map((col) => (
                    <th key={col} className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-700 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-[12px] text-slate-400">
                      No hay resultados para "{search}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, i) => {
                    const st = statusConfig[d.status] || statusConfig.pending;
                    const StatusIcon = st.icon;
                    return (
                      <tr
                        key={d.id}
                        className={`border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <td
                          className="px-2 py-2 text-[#29468B] font-medium cursor-pointer hover:underline"
                          onClick={() => goToPLC(d.id)}
                        >
                          {d.name}
                        </td>
                        <td className="px-2 py-2 text-slate-700">{d.driver_name}</td>
                        <td className="px-2 py-2 text-slate-600">{d.work_unit_detail?.name || "—"}</td>
                        <td className="px-2 py-2 font-mono text-[11px] text-slate-500">{d.connection_string}</td>

                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[4px] text-[8px] font-bold uppercase ${st.cls}`}>
                            <StatusIcon className="h-3 w-3" aria-hidden="true" />
                            {st.label}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={d.enabled}
                            onChange={() => handleToggle(d)}
                            className="w-4 h-4 cursor-pointer accent-[#29468B]"
                            title={d.enabled ? "Clic para deshabilitar" : "Clic para habilitar"}
                          />
                        </td>

                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button className={btnSecondary} onClick={(e) => { e.stopPropagation(); handleEdit(d); }} title="Editar">
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Editar
                            </button>
                            <button className={btnDanger} onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesPage;
