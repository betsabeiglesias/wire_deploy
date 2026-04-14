// frontend/src/modules/scada/pages/CreateEditTagPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createTag, getTag, updateTag, getPLC } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";

const DATATYPES = [
  "Boolean", "Int16", "Int32", "UInt16", "UInt32",
  "Float", "Double", "String", "DateTime", "Char",
];

const inputCls  = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const labelCls  = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const hintCls   = "text-[11px] text-slate-400 mt-0.5";
const panelCls  = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";

export default function CreateTagPage() {
  const { id, tagId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(tagId);

  const [plc, setPlc]   = useState(null);
  const [form, setForm] = useState({ name: "", address: "", datatype: "Float", unit: "" });

  const [loading, setLoading]         = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const plcData = await getPLC(id);
        setPlc(plcData);
        if (isEditing) {
          const tag = await getTag(id, tagId);
          setForm({ name: tag.name || "", address: tag.address || "", datatype: tag.datatype || "Float", unit: tag.unit || "" });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        Swal.fire({ icon: "error", title: "Error loading data", text: err.message || "Could not load data" });
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [id, tagId, isEditing]);

  function autoCalculateFC(address) {
    try {
      const addr = parseInt(address);
      if (isNaN(addr)) return null;
      if (addr >= 1     && addr <= 9999)  return 1;
      if (addr >= 10001 && addr <= 19999) return 2;
      if (addr >= 30001 && addr <= 39999) return 4;
      if (addr >= 40001 && addr <= 49999) return 3;
    } catch { return null; }
    return null;
  }

  function isModbusDriver() {
    if (!plc?.driver_name) return false;
    return plc.driver_name.toLowerCase().includes("modbus");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError(null);
    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (!form.address.trim()) return setError("La dirección es obligatoria");

    setLoading(true);
    const payload = { name: form.name.trim(), address: form.address.trim(), datatype: form.datatype, unit: form.unit.trim() || "" };

    if (isModbusDriver()) {
      const fc = autoCalculateFC(payload.address);
      if (fc) payload.fc = fc;
    }

    try {
      if (isEditing) {
        await updateTag(id, tagId, payload);
      } else {
        await createTag(id, payload);
      }
      markConfigDirty();
      Swal.fire({ icon: "success", title: isEditing ? "Variable actualizada" : "Variable creada", timer: 1500, showConfirmButton: false });
      navigate(`/devices/${id}`, { replace: true });
    } catch (err) {
      console.error("Tag error:", err);
      setError(err.message || "Failed to save tag");
      Swal.fire({ icon: "error", title: "Error", text: err.message || "No se pudo guardar la variable" });
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center gap-3 h-48">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#29468B]" />
        <p className="text-[12px] text-slate-500">Cargando variable...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          {isEditing ? "Editar variable" : "Nueva variable"}
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-xl mx-auto flex flex-col gap-3">

          {error && (
            <div className="px-3 py-2 rounded-[4px] border border-red-300 bg-red-50 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <section className={panelCls}>

            {/* NOMBRE */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre *</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                className={inputCls} placeholder="temperature_zone1"
                required disabled={loading}
              />
              <span className={hintCls}>Nombre técnico del tag (sin espacios)</span>
            </div>

            {/* DIRECCIÓN */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Dirección *</label>
              <input
                name="address" value={form.address} onChange={handleChange}
                className={`${inputCls} font-mono`}
                placeholder="ns=2;s=Temp.Zone1"
                required disabled={loading}
              />
              <span className={hintCls}>
                Ej: <code className="bg-slate-100 px-1 rounded text-[11px]">ns=2;s=Tag1</code> (OPC UA),{" "}
                <code className="bg-slate-100 px-1 rounded text-[11px]">DB1.DBW0</code> (Snap7),{" "}
                <code className="bg-slate-100 px-1 rounded text-[11px]">40001</code> (Modbus)
              </span>
              {isModbusDriver() && form.address && (
                <span className="text-[11px] text-[#29468B] mt-0.5">
                  FC se calculará automáticamente según el rango del address
                </span>
              )}
            </div>

            {/* TIPO DE DATO */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Tipo de dato *</label>
              <select
                name="datatype" value={form.datatype} onChange={handleChange}
                className={selectCls} required disabled={loading}
              >
                {DATATYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* UNIDAD */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Unidad (opcional)</label>
              <input
                name="unit" value={form.unit} onChange={handleChange}
                className={inputCls} placeholder="°C, bar, rpm, m³/h..."
                disabled={loading}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-xl mx-auto">
          <WizardNavigation
            onBack={() => navigate(`/devices/${id}`)}
            onNext={handleSubmit}
            nextLabel={
              loading
                ? isEditing ? "Guardando..." : "Creando..."
                : isEditing ? "Guardar cambios" : "Crear variable"
            }
            nextDisabled={loading || loadingData}
            nextClassName="bg-[#2A8B4B] hover:bg-[#237A41] text-white"
          />
        </div>
      </div>
    </div>
  );
}
