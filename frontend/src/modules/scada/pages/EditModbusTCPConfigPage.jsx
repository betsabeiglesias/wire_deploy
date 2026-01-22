// docker-suite/frontend/src/modules/scada/pages/EditModbusTCPConfigPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WizardNavigation from "@/components/WizardNavigationButton";
import { getPLC, updatePLC, regenerateGateway } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";

const EditModbusTCPConfigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
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
    driver: null,
    work_unit: null,
  });

  useEffect(() => {
    async function loadPLC() {
      try {
        const plc = await getPLC(id);
        
        // Parsear connection_string como fallback si connection_data está vacío
        let host = "";
        let port = 502;
        
        if (plc.connection_data && plc.connection_data.host) {
          host = plc.connection_data.host;
          port = plc.connection_data.port || 502;
        } else if (plc.connection_string) {
          const parts = plc.connection_string.split(":");
          host = parts[0];
          port = parts[1] ? parseInt(parts[1]) : 502;
        }
        
        setForm({
          name: plc.name || "",
          description: plc.description || "",
          enabled: plc.enabled || false,
          host: host,
          port: port,
          poll_rate_ms: plc.connection_data?.poll_rate_ms ?? 500,
          byte_order: plc.connection_data?.byte_order || "big",
          word_order: plc.connection_data?.word_order || "little",
        });

        setImmutableFields({
          driver: plc.driver,
          work_unit: plc.work_unit,
        });

      } catch (err) {
        console.error("Error loading PLC:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la configuración del PLC",
        });
        navigate("/devices");
      } finally {
        setLoadingData(false);
      }
    }

    loadPLC();
  }, [id, navigate]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.host.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "El nombre y host son requeridos",
      });
    }

    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      enabled: form.enabled,
      driver: immutableFields.driver,
      work_unit: immutableFields.work_unit,
      connection_string: `${form.host}:${form.port}`,
      connection_data: {
        host: form.host,
        port: form.port,
        poll_rate_ms: form.poll_rate_ms,
        byte_order: form.byte_order,
        word_order: form.word_order,
      },
    };

    try {
      await updatePLC(id, payload);
      
      // Marcar como sucio Y regenerar automáticamente
      markConfigDirty();
      
      // 🔥 Regenerar gateway automáticamente
      try {
        await regenerateGateway();
        console.log("✅ Gateway regenerated automatically");
      } catch (regenErr) {
        console.warn("⚠️ Could not regenerate gateway:", regenErr);
        // No fallar todo el guardado si la regeneración falla
      }
      
      Swal.fire({
        icon: "success",
        title: "PLC actualizado",
        text: "Los cambios se han guardado y aplicado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/devices");
    } catch (err) {
      console.error("Error updating PLC:", err);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: err.message || "No se pudo actualizar el PLC",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Editar Dispositivo Modbus TCP</h1>

      {/* GENERAL */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">General</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Name (Technical Identifier)</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="ModbusPLC01"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Power meter on line 1"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            disabled={loading}
          />
          <label className="text-sm">Enabled</label>
        </div>
      </div>

      {/* CONNECTION */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Connection</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Host / IP</label>
          <input
            value={form.host}
            onChange={(e) => update("host", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="192.168.100.94"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Port</label>
          <input
            type="number"
            value={form.port}
            onChange={(e) => update("port", Number(e.target.value))}
            className="w-full border p-2 rounded"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Poll rate (ms)</label>
          <input
            type="number"
            value={form.poll_rate_ms}
            onChange={(e) => update("poll_rate_ms", Number(e.target.value))}
            className="w-full border p-2 rounded"
            disabled={loading}
          />
        </div>
      </div>

      {/* MODBUS FORMAT */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Default Modbus Format</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Byte Order</label>
            <select
              value={form.byte_order}
              onChange={(e) => update("byte_order", e.target.value)}
              className="w-full border p-2 rounded"
              disabled={loading}
            >
              <option value="big">Big Endian</option>
              <option value="little">Little Endian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Word Order</label>
            <select
              value={form.word_order}
              onChange={(e) => update("word_order", e.target.value)}
              className="w-full border p-2 rounded"
              disabled={loading}
            >
              <option value="big">Big Endian</option>
              <option value="little">Little Endian</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-2">
          These settings apply globally. Items may override format individually.
        </p>
      </div>

      {/* BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices")}
        onNext={handleSave}
        nextLabel={loading ? "Guardando..." : "Guardar"}
        nextClassName="bg-green-600 hover:bg-green-700 text-white"
        nextDisabled={loading || form.name.trim() === "" || form.host.trim() === ""}
      />
    </div>
  );
};

export default EditModbusTCPConfigPage;
