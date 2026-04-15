// frontend/src/modules/scada/pages/EditOPCUAConfigPage.jsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPLC, patchPLC } from "../api/plcApi";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls = "text-[11px] text-slate-400 mt-0.5";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";

const EditOPCUAConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,
    endpoint: "",
    namespace_uri: "",
    security_mode: "None",
    security_policy: "None",
    timeout_connect: 5000,
    timeout_session: 10000,
    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 10000,
    publishing_interval_ms: 500,
    sampling_interval_ms: 200,
    queue_size: 10,
    discard_oldest: true,
    watchdog_ms: 4000,
    debounce_ms: 3000,
  });
  const [immutableFields, setImmutableFields] = useState({
    driver_code: "opcua",
    work_unit: null,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const hydrateForm = (plc) => {
    setForm({
      name: plc.name || "",
      description: plc.description || "",
      enabled: plc.enabled || false,
      endpoint: plc.connection_data?.endpoint || "",
      namespace_uri: plc.connection_data?.namespace_uri || "",
      security_mode: plc.connection_data?.security_mode || "None",
      security_policy: plc.connection_data?.security_policy || "None",
      timeout_connect: plc.connection_data?.timeouts_ms?.connect ?? 5000,
      timeout_session: plc.connection_data?.timeouts_ms?.session ?? 10000,
      reconnect_enable: plc.connection_data?.reconnect?.enable ?? true,
      reconnect_min_delay: plc.connection_data?.reconnect?.min_delay_ms ?? 1000,
      reconnect_max_delay: plc.connection_data?.reconnect?.max_delay_ms ?? 10000,
      publishing_interval_ms: plc.connection_data?.subscription?.publishing_interval_ms ?? 500,
      sampling_interval_ms: plc.connection_data?.subscription?.sampling_interval_ms ?? 200,
      queue_size: plc.connection_data?.subscription?.queue_size ?? 10,
      discard_oldest: plc.connection_data?.subscription?.discard_oldest ?? true,
      watchdog_ms: plc.connection_data?.subscription?.watchdog_ms ?? 4000,
      debounce_ms: plc.connection_data?.subscription?.debounce_ms ?? 3000,
    });

    setImmutableFields({
      driver_code: "opcua",
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
    if (!form.name.trim() || !form.endpoint.trim()) {
      return Swal.fire({ icon: "error", title: "Datos incompletos", text: "El nombre y endpoint son requeridos" });
    }

    setLoading(true);
    try {
      await patchPLC(id, {
        name: form.name,
        description: form.description,
        enabled: form.enabled,
        driver_code: immutableFields.driver_code,
        work_unit: immutableFields.work_unit,
        connection_string: form.endpoint,
        connection_data: {
          endpoint: form.endpoint,
          namespace_uri: form.namespace_uri,
          security_mode: form.security_mode,
          security_policy: form.security_policy,
          timeouts_ms: {
            connect: form.timeout_connect,
            session: form.timeout_session,
          },
          reconnect: {
            enable: form.reconnect_enable,
            min_delay_ms: form.reconnect_min_delay,
            max_delay_ms: form.reconnect_max_delay,
          },
          subscription: {
            publishing_interval_ms: form.publishing_interval_ms,
            sampling_interval_ms: form.sampling_interval_ms,
            queue_size: form.queue_size,
            discard_oldest: form.discard_oldest,
            watchdog_ms: form.watchdog_ms,
            debounce_ms: form.debounce_ms,
          },
        },
      });

      Swal.fire({ icon: "success", title: "PLC actualizado", text: "Los cambios se aplicaran automaticamente.", timer: 2000, showConfirmButton: false });
      navigate("/devices");
    } catch (err) {
      console.error("Error updating PLC:", err);
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
          Editar dispositivo OPC UA
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <section className={panelCls}>
            <h2 className={secTitleCls}>General</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="OPCUA_EBW01" disabled={loading} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Descripcion</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="OPC UA gateway for EBW line" disabled={loading} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
              <span className="text-[12px] text-slate-700">Habilitado</span>
            </label>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Conexion</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Endpoint URL *</label>
              <input value={form.endpoint} onChange={(e) => update("endpoint", e.target.value)} className={inputCls} placeholder="opc.tcp://host:4840/server" disabled={loading} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Namespace URI</label>
              <input value={form.namespace_uri} onChange={(e) => update("namespace_uri", e.target.value)} className={inputCls} placeholder="http://my-namespace.local" disabled={loading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Modo de seguridad</label>
                <select value={form.security_mode} onChange={(e) => update("security_mode", e.target.value)} className={selectCls} disabled={loading}>
                  <option>None</option>
                  <option>Sign</option>
                  <option>SignAndEncrypt</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Politica de seguridad</label>
                <select value={form.security_policy} onChange={(e) => update("security_policy", e.target.value)} className={selectCls} disabled={loading}>
                  <option>None</option>
                  <option>Basic256</option>
                  <option>Basic256Sha256</option>
                  <option>AES128_Sha256_RsaOaep</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout conexion (ms)</label>
                <input type="number" value={form.timeout_connect} onChange={(e) => update("timeout_connect", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout sesion (ms)</label>
                <input type="number" value={form.timeout_session} onChange={(e) => update("timeout_session", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reconnect_enable} onChange={(e) => update("reconnect_enable", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
              <span className="text-[12px] text-slate-700">Habilitar reconexion</span>
            </label>
            {form.reconnect_enable && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay minimo (ms)</label>
                  <input type="number" value={form.reconnect_min_delay} onChange={(e) => update("reconnect_min_delay", Number(e.target.value))} className={inputCls} disabled={loading} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay maximo (ms)</label>
                  <input type="number" value={form.reconnect_max_delay} onChange={(e) => update("reconnect_max_delay", Number(e.target.value))} className={inputCls} disabled={loading} />
                </div>
              </div>
            )}
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Suscripcion</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Intervalo publicacion (ms)</label>
                <input type="number" value={form.publishing_interval_ms} onChange={(e) => update("publishing_interval_ms", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Intervalo muestreo (ms)</label>
                <input type="number" value={form.sampling_interval_ms} onChange={(e) => update("sampling_interval_ms", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tamano de cola</label>
                <input type="number" value={form.queue_size} onChange={(e) => update("queue_size", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" checked={form.discard_oldest} onChange={(e) => update("discard_oldest", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
                <span className="text-[12px] text-slate-700">Descartar mas antiguos</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Watchdog (ms)</label>
                <input type="number" value={form.watchdog_ms} onChange={(e) => update("watchdog_ms", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Debounce (ms)</label>
                <input type="number" value={form.debounce_ms} onChange={(e) => update("debounce_ms", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
            </div>
            <span className={hintCls}>Los valores de suscripcion afectan la frecuencia de actualizacion de los datos.</span>
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
            nextDisabled={loading || form.name.trim() === "" || form.endpoint.trim() === ""}
          />
        </div>
      </div>
    </div>
  );
};

export default EditOPCUAConfigPage;
