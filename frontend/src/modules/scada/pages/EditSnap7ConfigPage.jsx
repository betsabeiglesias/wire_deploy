// frontend/src/modules/scada/pages/EditSnap7ConfigPage.jsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPLC, patchPLC } from "../api/plcApi";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls = "text-[11px] text-slate-400 mt-0.5";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";

const EditSnap7ConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,
    hostname: "",
    rack: 0,
    slot: 1,
    timeout_ms: 5000,
    pdu_size: 480,
    poll_ms: 1000,
    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 60000,
  });
  const [immutableFields, setImmutableFields] = useState({
    driver_code: "snap7",
    work_unit: null,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const hydrateForm = (plc) => {
    setForm({
      name: plc.name || "",
      description: plc.description || "",
      enabled: plc.enabled || false,
      hostname: plc.connection_data?.hostname || "",
      rack: plc.connection_data?.rack ?? 0,
      slot: plc.connection_data?.slot ?? 1,
      timeout_ms: plc.connection_data?.timeout_ms ?? 5000,
      pdu_size: plc.connection_data?.pdu_size ?? 480,
      poll_ms: plc.connection_data?.poll_ms ?? 1000,
      reconnect_enable: plc.connection_data?.reconnect?.enable ?? true,
      reconnect_min_delay: plc.connection_data?.reconnect?.min_delay_ms ?? 1000,
      reconnect_max_delay: plc.connection_data?.reconnect?.max_delay_ms ?? 60000,
    });

    setImmutableFields({
      driver_code: "snap7",
      work_unit: plc.work_unit,
    });
  };

  useEffect(() => {
    async function loadPLC() {
      try {
        const plc = await getPLC(id);
        hydrateForm(plc);
      } catch (err) {
        console.error("Error loading PLC:", err);
        if (location.state?.plc) {
          hydrateForm(location.state.plc);
        } else {
          Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar la configuracion del PLC" });
          navigate("/devices");
        }
      } finally {
        setLoadingData(false);
      }
    }

    loadPLC();
  }, [id, location.state, navigate]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.hostname.trim()) {
      return Swal.fire({ icon: "error", title: "Datos incompletos", text: "El nombre y hostname son requeridos" });
    }

    setLoading(true);
    try {
      await patchPLC(id, {
        name: form.name,
        description: form.description,
        enabled: form.enabled,
        driver_code: immutableFields.driver_code,
        work_unit: immutableFields.work_unit,
        connection_string: form.hostname,
        connection_data: {
          hostname: form.hostname,
          rack: form.rack,
          slot: form.slot,
          timeout_ms: form.timeout_ms,
          pdu_size: form.pdu_size,
          poll_ms: form.poll_ms,
          reconnect: {
            enable: form.reconnect_enable,
            min_delay_ms: form.reconnect_min_delay,
            max_delay_ms: form.reconnect_max_delay,
          },
        },
      });

      Swal.fire({ icon: "success", title: "PLC actualizado", text: "Los cambios se aplicaran automaticamente.", timer: 2000, showConfirmButton: false });
      navigate("/devices");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al actualizar", text: err.message || "No se pudo actualizar el PLC" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center gap-3 h-48">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#29468B]" />
        <p className="text-[12px] text-slate-500">Cargando configuracion...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Editar dispositivo Siemens S7
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <section className={panelCls}>
            <h2 className={secTitleCls}>General</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="S7_EBW01" disabled={loading} />
              <span className={hintCls}>Ej: S7_EBW01, Snap7_MainConveyor</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Descripcion</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="Siemens S7-1200 on extruder line 1" disabled={loading} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
              <span className="text-[12px] text-slate-700">Habilitado</span>
            </label>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Conexion</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Hostname / Direccion IP *</label>
              <input value={form.hostname} onChange={(e) => update("hostname", e.target.value)} className={inputCls} placeholder="10.100.100.200" disabled={loading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Rack</label>
                <input type="number" value={form.rack} onChange={(e) => update("rack", Number(e.target.value))} className={inputCls} min="0" disabled={loading} />
                <span className={hintCls}>Normalmente 0 para S7-1200/1500</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Slot</label>
                <input type="number" value={form.slot} onChange={(e) => update("slot", Number(e.target.value))} className={inputCls} min="0" disabled={loading} />
                <span className={hintCls}>Normalmente 1 (slot CPU)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout (ms)</label>
                <input type="number" value={form.timeout_ms} onChange={(e) => update("timeout_ms", Number(e.target.value))} className={inputCls} min="100" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tamano PDU</label>
                <input type="number" value={form.pdu_size} onChange={(e) => update("pdu_size", Number(e.target.value))} className={inputCls} min="240" max="960" disabled={loading} />
                <span className={hintCls}>240-960 bytes</span>
              </div>
            </div>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Polling</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Intervalo de polling (ms)</label>
              <input type="number" value={form.poll_ms} onChange={(e) => update("poll_ms", Number(e.target.value))} className={inputCls} min="100" disabled={loading} />
              <span className={hintCls}>Recomendado: 1000 ms</span>
            </div>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Reconexion</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reconnect_enable} onChange={(e) => update("reconnect_enable", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
              <span className="text-[12px] text-slate-700">Habilitar reconexion automatica</span>
            </label>
            {form.reconnect_enable && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay minimo (ms)</label>
                  <input type="number" value={form.reconnect_min_delay} onChange={(e) => update("reconnect_min_delay", Number(e.target.value))} className={inputCls} min="100" disabled={loading} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay maximo (ms)</label>
                  <input type="number" value={form.reconnect_max_delay} onChange={(e) => update("reconnect_max_delay", Number(e.target.value))} className={inputCls} min="1000" disabled={loading} />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <WizardNavigation
            onBack={() => navigate("/devices")}
            onNext={handleSave}
            nextLabel={loading ? "Guardando..." : "Guardar"}
            nextClassName="bg-[#2A8B4B] hover:bg-[#237A41] text-white"
            nextDisabled={loading || form.name.trim() === "" || form.hostname.trim() === ""}
          />
        </div>
      </div>
    </div>
  );
};

export default EditSnap7ConfigPage;
