// frontend/src/modules/scada/pages/OPCUAConfigPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls  = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors";
const labelCls  = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const panelCls  = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";

const OPCUAConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", description: "", enabled: false,
    endpoint: "", namespace_uri: "",
    security_mode: "None", security_policy: "None",
    timeout_connect: 5000, timeout_session: 10000,
    reconnect_enable: true, reconnect_min_delay: 1000, reconnect_max_delay: 10000,
    publishing_interval_ms: 500, sampling_interval_ms: 200,
    queue_size: 10, discard_oldest: true,
    watchdog_ms: 4000, debounce_ms: 3000,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = () =>
    navigate("/devices/new/isa95", { state: { from: "opcua", connection: form } });

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Configurar dispositivo OPC UA
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">

          {/* GENERAL */}
          <section className={panelCls}>
            <h2 className={secTitleCls}>General</h2>
            <p className="text-[11px] text-slate-500">
              El <strong>identificador técnico</strong> debe ser único e independiente de la estructura ISA-95.
            </p>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="OPCUA_EBW01" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Descripción</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="OPC UA gateway for EBW line" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 accent-[#29468B]" />
              <span className="text-[12px] text-slate-700">Habilitado</span>
            </label>
          </section>

          {/* CONNECTION */}
          <section className={panelCls}>
            <h2 className={secTitleCls}>Conexión</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Endpoint URL *</label>
              <input value={form.endpoint} onChange={(e) => update("endpoint", e.target.value)} className={inputCls} placeholder="opc.tcp://host:4840/server" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Namespace URI</label>
              <input value={form.namespace_uri} onChange={(e) => update("namespace_uri", e.target.value)} className={inputCls} placeholder="http://my-namespace.local" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Modo de seguridad</label>
                <select value={form.security_mode} onChange={(e) => update("security_mode", e.target.value)} className={selectCls}>
                  <option>None</option><option>Sign</option><option>SignAndEncrypt</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Política de seguridad</label>
                <select value={form.security_policy} onChange={(e) => update("security_policy", e.target.value)} className={selectCls}>
                  <option>None</option><option>Basic256</option><option>Basic256Sha256</option><option>AES128_Sha256_RsaOaep</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout conexión (ms)</label>
                <input type="number" value={form.timeout_connect} onChange={(e) => update("timeout_connect", Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout sesión (ms)</label>
                <input type="number" value={form.timeout_session} onChange={(e) => update("timeout_session", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reconnect_enable} onChange={(e) => update("reconnect_enable", e.target.checked)} className="w-4 h-4 accent-[#29468B]" />
              <span className="text-[12px] text-slate-700">Habilitar reconexión</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Delay mínimo (ms)</label>
                <input type="number" value={form.reconnect_min_delay} onChange={(e) => update("reconnect_min_delay", Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Delay máximo (ms)</label>
                <input type="number" value={form.reconnect_max_delay} onChange={(e) => update("reconnect_max_delay", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </section>

          {/* SUBSCRIPTION */}
          <section className={panelCls}>
            <h2 className={secTitleCls}>Suscripción</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Intervalo publicación (ms)</label>
                <input type="number" value={form.publishing_interval_ms} onChange={(e) => update("publishing_interval_ms", Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Intervalo muestreo (ms)</label>
                <input type="number" value={form.sampling_interval_ms} onChange={(e) => update("sampling_interval_ms", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tamaño de cola</label>
                <input type="number" value={form.queue_size} onChange={(e) => update("queue_size", Number(e.target.value))} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" checked={form.discard_oldest} onChange={(e) => update("discard_oldest", e.target.checked)} className="w-4 h-4 accent-[#29468B]" />
                <span className="text-[12px] text-slate-700">Descartar más antiguos</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Watchdog (ms)</label>
                <input type="number" value={form.watchdog_ms} onChange={(e) => update("watchdog_ms", Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Debounce (ms)</label>
                <input type="number" value={form.debounce_ms} onChange={(e) => update("debounce_ms", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <WizardNavigation
            onBack={() => navigate("/devices/new")}
            onNext={handleNext}
            nextDisabled={form.name.trim() === "" || form.endpoint.trim() === ""}
            nextLabel="Continuar"
          />
        </div>
      </div>
    </div>
  );
};

export default OPCUAConfigPage;
