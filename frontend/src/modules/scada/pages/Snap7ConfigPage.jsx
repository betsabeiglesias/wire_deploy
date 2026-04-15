// frontend/src/modules/scada/pages/Snap7ConfigPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";

// ── Clases DS ─────────────────────────────────────────────────────────
const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls  = "text-[11px] text-slate-400 mt-0.5";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";

const Snap7ConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", description: "", enabled: false,
    hostname: "", rack: 0, slot: 1,
    timeout_ms: 5000, pdu_size: 480, poll_ms: 1000,
    reconnect_enable: true, reconnect_min_delay: 1000, reconnect_max_delay: 60000,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = () =>
    navigate("/devices/new/isa95", { state: { from: "snap7", connection: form } });

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Configurar dispositivo Siemens S7
        </h1>
      </div>

      {/* Formulario */}
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
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="S7_EBW01" />
              <span className={hintCls}>Ej: S7_EBW01, Snap7_MainConveyor, PLC_S7_Line3A</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Descripción</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="Siemens S7-1200 on extruder line 1" />
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
              <label className={labelCls}>Hostname / Dirección IP *</label>
              <input value={form.hostname} onChange={(e) => update("hostname", e.target.value)} className={inputCls} placeholder="10.100.100.200" />
              <span className={hintCls}>IP o hostname del PLC Siemens S7</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Rack</label>
                <input type="number" value={form.rack} onChange={(e) => update("rack", Number(e.target.value))} className={inputCls} min="0" />
                <span className={hintCls}>Normalmente 0 para S7-1200/1500</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Slot</label>
                <input type="number" value={form.slot} onChange={(e) => update("slot", Number(e.target.value))} className={inputCls} min="0" />
                <span className={hintCls}>Normalmente 1 (slot CPU)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Timeout (ms)</label>
                <input type="number" value={form.timeout_ms} onChange={(e) => update("timeout_ms", Number(e.target.value))} className={inputCls} min="100" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tamaño PDU</label>
                <input type="number" value={form.pdu_size} onChange={(e) => update("pdu_size", Number(e.target.value))} className={inputCls} min="240" max="960" />
                <span className={hintCls}>240–960 bytes (defecto: 480)</span>
              </div>
            </div>
          </section>

          {/* POLLING */}
          <section className={panelCls}>
            <h2 className={secTitleCls}>Polling</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Intervalo de polling (ms)</label>
              <input type="number" value={form.poll_ms} onChange={(e) => update("poll_ms", Number(e.target.value))} className={inputCls} min="100" />
              <span className={hintCls}>Con qué frecuencia leer el PLC (recomendado: 1000 ms)</span>
            </div>
          </section>

          {/* RECONNECT */}
          <section className={panelCls}>
            <h2 className={secTitleCls}>Reconexión</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reconnect_enable} onChange={(e) => update("reconnect_enable", e.target.checked)} className="w-4 h-4 accent-[#29468B]" />
              <span className="text-[12px] text-slate-700">Habilitar reconexión automática</span>
            </label>
            {form.reconnect_enable && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay mínimo (ms)</label>
                  <input type="number" value={form.reconnect_min_delay} onChange={(e) => update("reconnect_min_delay", Number(e.target.value))} className={inputCls} min="100" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Delay máximo (ms)</label>
                  <input type="number" value={form.reconnect_max_delay} onChange={(e) => update("reconnect_max_delay", Number(e.target.value))} className={inputCls} min="1000" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Navegación */}
      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <WizardNavigation
            onBack={() => navigate("/devices/new")}
            onNext={handleNext}
            nextDisabled={form.name.trim() === "" || form.hostname.trim() === ""}
            nextLabel="Continuar"
          />
        </div>
      </div>
    </div>
  );
};

export default Snap7ConfigPage;
