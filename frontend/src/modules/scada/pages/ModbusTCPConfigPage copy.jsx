// frontend/src/modules/scada/pages/ModbusTCPConfigPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceWizardTabs from "../components/DeviceWizardTabs";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls = "text-[11px] text-slate-400 mt-0.5";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";

const ModbusTCPConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,
    host: "",
    port: 502,
    poll_rate_ms: 500,
    byte_order: "big",
    word_order: "little",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = () =>
    navigate("/devices/new/isa95", { state: { from: "modbus", connection: form } });

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Configurar dispositivo Modbus TCP
        </h1>
      </div>

      <DeviceWizardTabs
        steps={[
          { key: "protocol", label: "Protocolo", description: "Disponible", to: "/devices/new", enabled: true, current: false },
          { key: "config", label: "Configuracion", description: "Modbus TCP", to: "/devices/new/modbus", enabled: true, current: true },
          { key: "isa95", label: "ISA-95", description: "Pendiente", to: null, enabled: false, current: false },
        ]}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <section className={panelCls}>
            <h2 className={secTitleCls}>General</h2>
            <p className="text-[11px] text-slate-500">
              El <strong>identificador tÃ©cnico</strong> debe ser Ãºnico e independiente de la estructura ISA-95.
            </p>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="ModbusPLC01" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>DescripciÃ³n</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="Power meter on line 1" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 accent-[#29468B]" />
              <span className="text-[12px] text-slate-700">Habilitado</span>
            </label>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>ConexiÃ³n</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Host / IP *</label>
              <input value={form.host} onChange={(e) => update("host", e.target.value)} className={inputCls} placeholder="192.168.100.94" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Puerto</label>
                <input type="number" value={form.port} onChange={(e) => update("port", Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Poll rate (ms)</label>
                <input type="number" value={form.poll_rate_ms} onChange={(e) => update("poll_rate_ms", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Formato Modbus por defecto</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Orden de bytes</label>
                <select value={form.byte_order} onChange={(e) => update("byte_order", e.target.value)} className={selectCls}>
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Orden de palabras</label>
                <select value={form.word_order} onChange={(e) => update("word_order", e.target.value)} className={selectCls}>
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
            </div>
            <span className={hintCls}>Aplica globalmente. Cada Ã­tem puede sobreescribir el formato.</span>
          </section>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <WizardNavigation
            onBack={() => navigate("/devices/new")}
            onNext={handleNext}
            nextDisabled={form.name.trim() === "" || form.host.trim() === ""}
            nextLabel="Continuar"
          />
        </div>
      </div>
    </div>
  );
};

export default ModbusTCPConfigPage;
