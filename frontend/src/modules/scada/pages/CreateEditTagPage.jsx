// frontend/src/modules/scada/pages/CreateEditTagPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createTag, getTag, updateTag, getPLC } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";

const DATATYPES = [
  "Boolean", "Int16", "Int32", "UInt16", "UInt32",
  "Float", "Double", "String", "DateTime", "Char"
];

export default function CreateTagPage() {
  const { id, tagId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(tagId);

  const [plc, setPlc] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    datatype: "Float",
    unit: ""
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // LOAD PLC AND TAG DATA
  // =========================
  useEffect(() => {
    async function load() {
      try {
        // Cargar información del PLC
        console.log(`🔍 Loading PLC ${id}...`);
        const plcData = await getPLC(id);
        setPlc(plcData);
        console.log("✅ PLC loaded:", plcData);

        // Si estamos editando, cargar el tag
        if (isEditing) {
          console.log(`🔍 Loading tag ${tagId}...`);
          const tag = await getTag(id, tagId);
          console.log("✅ Tag loaded:", tag);
          
          setForm({
            name: tag.name || "",
            address: tag.address || "",
            datatype: tag.datatype || "Float",
            unit: tag.unit || ""
          });
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
        Swal.fire({
          icon: "error",
          title: "Error loading data",
          text: err.message || "Could not load data"
        });
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [id, tagId, isEditing]);

  // =========================
  // 🔥 AUTO-CALCULATE FC FOR MODBUS
  // =========================
  function autoCalculateFC(address) {
    try {
      const addr = parseInt(address);
      if (isNaN(addr)) return null;

      if (addr >= 1 && addr <= 9999) return 1;      // Coils
      if (addr >= 10001 && addr <= 19999) return 2; // Discrete Inputs
      if (addr >= 30001 && addr <= 39999) return 4; // Input Registers
      if (addr >= 40001 && addr <= 49999) return 3; // Holding Registers
    } catch {
      return null;
    }
    
    return null;
  }

  // =========================
  // 🔥 CHECK IF PLC IS MODBUS
  // =========================
  function isModbusDriver() {
    if (!plc || !plc.driver_name) return false;
    const driverLower = plc.driver_name.toLowerCase();
    return driverLower.includes("modbus");
  }

  // =========================
  // HANDLE FIELD CHANGES
  // =========================
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // =========================
  // CREATE OR UPDATE TAG
  // =========================
  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError(null);

    if (!form.name.trim()) return setError("Name is required");
    if (!form.address.trim()) return setError("Address is required");

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      datatype: form.datatype,
      unit: form.unit.trim() || ""
    };

    // 🔥 AUTO-CALCULAR FC PARA MODBUS
    if (isModbusDriver()) {
      const fc = autoCalculateFC(payload.address);
      if (fc) {
        payload.fc = fc;
        console.log(`🧠 Auto-calculated FC${fc} for address ${payload.address}`);
      }
    }

    try {
      if (isEditing) {
        // =========================
        // UPDATE TAG
        // =========================
        console.log("🔧 Updating tag:", payload);
        await updateTag(id, tagId, payload);

        markConfigDirty();

        Swal.fire({
          icon: "success",
          title: "Variable actualizada",
          timer: 1500,
          showConfirmButton: false
        });

      } else {
        // =========================
        // CREATE TAG
        // =========================
        console.log("➕ Creating tag:", payload);
        await createTag(id, payload);

        markConfigDirty();

        Swal.fire({
          icon: "success",
          title: "Variable creada",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      navigate(`/devices/${id}`, { replace: true });

    } catch (err) {
      console.error("❌ Tag error:", err);
      setError(err.message || "Failed to save tag");
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo guardar la variable",
      });

    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOADING STATE
  // =========================
  if (loadingData) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Cargando variable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditing ? "Editar Variable" : "Crear Variable"}
      </h1>

      <form className="space-y-4 bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="temperature_zone1"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Nombre técnico del tag (sin espacios)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección *</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="ns=2;s=Temp.Zone1"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ejemplos: <code className="bg-gray-100 px-1 rounded">ns=2;s=Tag1</code> (OPC UA), 
            {" "}<code className="bg-gray-100 px-1 rounded">DB1.DBW0</code> (Snap7), 
            {" "}<code className="bg-gray-100 px-1 rounded">40001</code> (Modbus)
          </p>
          {isModbusDriver() && form.address && (
            <p className="text-xs text-blue-600 mt-1">
              💡 FC se calculará automáticamente según el rango del address
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Dato *</label>
          <select
            name="datatype"
            value={form.datatype}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          >
            {DATATYPES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Unidad (opcional)</label>
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="°C, bar, rpm, m³/h..."
            disabled={loading}
          />
        </div>

        <WizardNavigation
          backTo={`/devices/${id}`}
          onNext={handleSubmit}
          nextLabel={
            loading 
              ? (isEditing ? "Guardando..." : "Creando...") 
              : (isEditing ? "Guardar Cambios" : "Crear Variable")
          }
          nextDisabled={loading || loadingData}
          nextClassName={`${loading ? 'opacity-50 cursor-not-allowed' : ''} bg-green-600 hover:bg-green-700 text-white`}
        />
      </form>
    </div>
  );
}
