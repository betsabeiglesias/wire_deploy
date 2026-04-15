// frontend/src/modules/scada/pages/EditModbusTCPConfigPage.jsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPLC, patchPLC } from "../api/plcApi";
import Swal from "sweetalert2";
import ProtocolNotice from "../components/ProtocolNotice";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls = "text-[11px] text-slate-400 mt-0.5";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";
const secTitleCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-1";
const protocolLabels = { snap7: "Siemens Snap7", modbus: "Modbus TCP", opcua: "OPC UA" };

const EditModbusTCPConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [protocolMismatch, setProtocolMismatch] = useState(null);
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
  const [immutableFields, setImmutableFields] = useState({
    driver_code: "modbus",
    work_unit: null,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const hydrateForm = (plc) => {
    if (plc.driver_code !== "modbus") {
      setProtocolMismatch(plc.driver_code || null);
      return;
    }

    setProtocolMismatch(null);
    let host = "";
    let port = 502;

    if (plc.connection_data?.host) {
      host = plc.connection_data.host;
      port = plc.connection_data.port || 502;
    } else if (plc.connection_string) {
      const parts = plc.connection_string.split(":");
      host = parts[0];
      port = parts[1] ? parseInt(parts[1], 10) : 502;
    }

    setForm({
      name: plc.name || "",
      description: plc.description || "",
      enabled: plc.enabled || false,
      host,
      port,
      poll_rate_ms: plc.connection_data?.poll_rate_ms ?? 500,
      byte_order: plc.connection_data?.byte_order || "big",
      word_order: plc.connection_data?.word_order || "little",
    });

    setImmutableFields({
      driver_code: "modbus",
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
    if (!form.name.trim() || !form.host.trim()) {
      return Swal.fire({ icon: "error", title: "Datos incompletos", text: "El nombre y host son requeridos" });
    }

    setLoading(true);
    try {
      await patchPLC(id, {
        name: form.name,
        description: form.description,
        enabled: form.enabled,
        driver_code: immutableFields.driver_code,
        work_unit: immutableFields.work_unit,
        connection_string: `${form.host}:${form.port}`,
        connection_data: {
          host: form.host,
          port: form.port,
          poll_rate_ms: form.poll_rate_ms,
          byte_order: form.byte_order,
          word_order: form.word_order,
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

  if (protocolMismatch) {
    return (
      <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
        <div className="px-3 py-2 bg-white border-b border-slate-200">
          <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Editar dispositivo Modbus TCP
          </h1>
        </div>
        <ProtocolNotice
          title="Necesitas seleccionar primero el protocolo correcto"
          description={`Este dispositivo no usa Modbus TCP, sino ${protocolLabels[protocolMismatch] || protocolMismatch}. Para editar su configuracion, abre la pantalla del protocolo correspondiente.`}
          primaryActionLabel="Ir al editor correcto"
          onPrimaryAction={() => navigate(`/devices/edit/${protocolMismatch}/${id}`)}
          secondaryActionLabel="Volver a dispositivos"
          onSecondaryAction={() => navigate("/devices")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Editar dispositivo Modbus TCP
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <section className={panelCls}>
            <h2 className={secTitleCls}>General</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="ModbusPLC01" disabled={loading} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Descripcion</label>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="Power meter on line 1" disabled={loading} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => update("enabled", e.target.checked)} className="w-4 h-4 accent-[#29468B]" disabled={loading} />
              <span className="text-[12px] text-slate-700">Habilitado</span>
            </label>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Conexion</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Host / IP *</label>
              <input value={form.host} onChange={(e) => update("host", e.target.value)} className={inputCls} placeholder="192.168.100.94" disabled={loading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Puerto</label>
                <input type="number" value={form.port} onChange={(e) => update("port", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Poll rate (ms)</label>
                <input type="number" value={form.poll_rate_ms} onChange={(e) => update("poll_rate_ms", Number(e.target.value))} className={inputCls} disabled={loading} />
              </div>
            </div>
          </section>

          <section className={panelCls}>
            <h2 className={secTitleCls}>Formato Modbus por defecto</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Orden de bytes</label>
                <select value={form.byte_order} onChange={(e) => update("byte_order", e.target.value)} className={selectCls} disabled={loading}>
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Orden de palabras</label>
                <select value={form.word_order} onChange={(e) => update("word_order", e.target.value)} className={selectCls} disabled={loading}>
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
            </div>
            <span className={hintCls}>Aplica globalmente. Cada item puede sobreescribir el formato.</span>
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
            nextDisabled={loading || form.name.trim() === "" || form.host.trim() === ""}
          />
        </div>
      </div>
    </div>
  );
};

export default EditModbusTCPConfigPage;
