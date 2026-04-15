// frontend/src/modules/scada/pages/CreateDevicePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cpu, Network, Radio } from "lucide-react";
import DeviceWizardTabs from "../components/DeviceWizardTabs";
import WizardNavigation from "../components/WizardNavigationButton";

const drivers = [
  {
    id: "snap7",
    title: "Siemens Snap7",
    description: "ConexiÃ³n a Siemens PLCs vÃ­a protocolo Snap7.",
    icon: Cpu,
    tag: "S7-300 / S7-400 / S7-1200 / S7-1500",
  },
  {
    id: "modbus",
    title: "Modbus TCP",
    description: "ConexiÃ³n a dispositivos vÃ­a protocolo Modbus TCP.",
    icon: Network,
    tag: "Puerto 502",
  },
  {
    id: "opcua",
    title: "OPC UA",
    description: "ConexiÃ³n a dispositivos vÃ­a protocolo OPC UA.",
    icon: Radio,
    tag: "opc.tcp://",
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
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Nuevo dispositivo â€” Seleccionar driver
        </h1>
      </div>

      <DeviceWizardTabs
        steps={[
          {
            key: "protocol",
            label: "Protocolo",
            description: "Paso actual",
            to: "/devices/new",
            enabled: true,
            current: true,
          },
          {
            key: "config",
            label: "Configuracion",
            description: selected ? drivers.find((driver) => driver.id === selected)?.title : "Pendiente",
            to: selected ? `/devices/new/${selected}` : null,
            enabled: Boolean(selected),
            current: false,
          },
          {
            key: "isa95",
            label: "ISA-95",
            description: "Pendiente",
            to: null,
            enabled: false,
            current: false,
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <p className="mb-2 text-[12px] text-slate-500">
            Selecciona el protocolo de comunicaciÃ³n del dispositivo que quieres aÃ±adir.
          </p>

          {drivers.map((driver) => {
            const Icon = driver.icon;
            const isActive = selected === driver.id;

            return (
              <label
                key={driver.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[6px] border p-3 transition-all duration-150 ${
                  isActive
                    ? "border-[#29468B] bg-[#EEF3FF] shadow-[0_1px_4px_rgba(41,70,139,0.15)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-[#F9F9FA]"
                }`}
              >
                <input
                  type="radio"
                  name="driver"
                  value={driver.id}
                  checked={isActive}
                  onChange={() => setSelected(driver.id)}
                  className="sr-only"
                />

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] ${
                    isActive ? "bg-[#29468B] text-white" : "bg-[#F2F3F5] text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold ${isActive ? "text-[#29468B]" : "text-slate-800"}`}>
                    {driver.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{driver.description}</p>
                </div>

                <span className="shrink-0 text-[10px] font-mono text-slate-400">{driver.tag}</span>

                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isActive ? "border-[#29468B] bg-[#29468B]" : "border-slate-300"
                  }`}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </label>
            );
          })}
        </div>
      </div>

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
