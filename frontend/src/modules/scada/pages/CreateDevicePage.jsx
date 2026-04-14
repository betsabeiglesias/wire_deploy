// frontend/src/modules/scada/pages/CreateDevicePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";
import { Cpu, Network, Radio } from "lucide-react";

const drivers = [
  {
    id:          "snap7",
    title:       "Siemens Snap7",
    description: "Conexión a Siemens PLCs vía protocolo Snap7.",
    icon:        Cpu,
    tag:         "S7-300 / S7-400 / S7-1200 / S7-1500",
  },
  {
    id:          "modbus",
    title:       "Modbus TCP",
    description: "Conexión a dispositivos vía protocolo Modbus TCP.",
    icon:        Network,
    tag:         "Puerto 502",
  },
  {
    id:          "opcua",
    title:       "OPC UA",
    description: "Conexión a dispositivos vía protocolo OPC UA.",
    icon:        Radio,
    tag:         "opc.tcp://",
  },
];

const CreateDevicePage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const handleNext = () => {
    if (!selected) return;
    navigate(`/devices/new/${selected}`, { state: { from: selected } });
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Nuevo dispositivo — Seleccionar driver
        </h1>
      </div>

      {/* ── Cards de selección ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <p className="text-[12px] text-slate-500 mb-2">
            Selecciona el protocolo de comunicación del dispositivo que quieres añadir.
          </p>

          {drivers.map((driver) => {
            const Icon      = driver.icon;
            const isActive  = selected === driver.id;
            return (
              <label
                key={driver.id}
                className={`flex items-center gap-3 p-3 rounded-[6px] border cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "border-[#29468B] bg-[#EEF3FF] shadow-[0_1px_4px_rgba(41,70,139,0.15)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-[#F9F9FA]"
                }`}
              >
                {/* Radio */}
                <input
                  type="radio"
                  name="driver"
                  value={driver.id}
                  checked={isActive}
                  onChange={() => setSelected(driver.id)}
                  className="sr-only"
                />

                {/* Icono */}
                <div className={`flex items-center justify-center h-9 w-9 rounded-[4px] shrink-0 ${
                  isActive ? "bg-[#29468B] text-white" : "bg-[#F2F3F5] text-slate-500"
                }`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold ${isActive ? "text-[#29468B]" : "text-slate-800"}`}>
                    {driver.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{driver.description}</p>
                </div>

                {/* Tag técnico */}
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{driver.tag}</span>

                {/* Indicador selección */}
                <span className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isActive ? "border-[#29468B] bg-[#29468B]" : "border-slate-300"
                }`}>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Navegación ─────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-lg mx-auto">
          <WizardNavigation
            onBack={() => navigate("/devices")}
            onNext={handleNext}
            nextDisabled={!selected}
            nextLabel="Continuar"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateDevicePage;
