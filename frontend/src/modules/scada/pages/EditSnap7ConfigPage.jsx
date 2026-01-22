// docker-suite/frontend/src/modules/scada/pages/EditSnap7ConfigPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WizardNavigation from "@/components/WizardNavigationButton";
import { getPLC, updatePLC } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";

const EditSnap7ConfigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,
    hostname: "",
    rack: 0,
    slot: 1,
    timeout_ms: 5000,
    pdu_size: 480,
    poll_ms: 1000,
    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 60000,
  });

  const [immutableFields, setImmutableFields] = useState({
    driver: null,
    work_unit: null,
  });

  useEffect(() => {
    async function loadPLC() {
      try {
        const plc = await getPLC(id);
        
        setForm({
          name: plc.name || "",
          description: plc.description || "",
          enabled: plc.enabled || false,
          hostname: plc.connection_data?.hostname || "",
          rack: plc.connection_data?.rack ?? 0,
          slot: plc.connection_data?.slot ?? 1,
          timeout_ms: plc.connection_data?.timeout_ms ?? 5000,
          pdu_size: plc.connection_data?.pdu_size ?? 480,
          poll_ms: plc.connection_data?.poll_ms ?? 1000,
          reconnect_enable: plc.connection_data?.reconnect?.enable ?? true,
          reconnect_min_delay: plc.connection_data?.reconnect?.min_delay_ms ?? 1000,
          reconnect_max_delay: plc.connection_data?.reconnect?.max_delay_ms ?? 60000,
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
    if (!form.name.trim() || !form.hostname.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "El nombre y hostname son requeridos",
      });
    }

    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      enabled: form.enabled,
      driver: immutableFields.driver,
      work_unit: immutableFields.work_unit,
      connection_string: form.hostname,
      connection_data: {
        hostname: form.hostname,
        rack: form.rack,
        slot: form.slot,
        timeout_ms: form.timeout_ms,
        pdu_size: form.pdu_size,
        poll_ms: form.poll_ms,
        reconnect: {
          enable: form.reconnect_enable,
          min_delay_ms: form.reconnect_min_delay,
          max_delay_ms: form.reconnect_max_delay,
        },
      },
    };

    try {
      await updatePLC(id, payload);
      
      markConfigDirty();
      
      Swal.fire({
        icon: "success",
        title: "PLC actualizado",
        text: "Los cambios se han guardado correctamente",
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
      <h1 className="text-3xl font-semibold mb-6">Editar Dispositivo Siemens S7</h1>

      {/* GENERAL */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">General</h2>

        <p className="text-sm text-gray-600 mb-4">
          The <strong>technical identifier</strong> should be unique and independent from ISA-95 structure.
        </p>

        <div className="mb-3">
          <label className="block text-sm font-medium">Name (Technical Identifier)</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="S7_EBW01"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Examples: S7_EBW01, Snap7_MainConveyor, PLC_S7_Line3A
          </p>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Siemens S7-1200 on extruder line 1"
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
          <label className="block text-sm font-medium">Hostname / IP Address</label>
          <input
            value={form.hostname}
            onChange={(e) => update("hostname", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="10.100.100.200"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            IP address or hostname of the Siemens S7 PLC
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium">Rack</label>
            <input
              type="number"
              value={form.rack}
              onChange={(e) => update("rack", Number(e.target.value))}
              className="w-full border p-2 rounded"
              min="0"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Usually 0 for S7-1200/1500</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Slot</label>
            <input
              type="number"
              value={form.slot}
              onChange={(e) => update("slot", Number(e.target.value))}
              className="w-full border p-2 rounded"
              min="0"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Usually 1 for CPU slot</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Timeout (ms)</label>
            <input
              type="number"
              value={form.timeout_ms}
              onChange={(e) => update("timeout_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
              min="100"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Connection timeout</p>
          </div>

          <div>
            <label className="block text-sm font-medium">PDU Size</label>
            <input
              type="number"
              value={form.pdu_size}
              onChange={(e) => update("pdu_size", Number(e.target.value))}
              className="w-full border p-2 rounded"
              min="240"
              max="960"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">240-960 bytes (default: 480)</p>
          </div>
        </div>
      </div>

      {/* POLLING */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Polling</h2>

        <div>
          <label className="block text-sm font-medium">Poll Interval (ms)</label>
          <input
            type="number"
            value={form.poll_ms}
            onChange={(e) => update("poll_ms", Number(e.target.value))}
            className="w-full border p-2 rounded"
            min="100"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            How often to read data from the PLC (recommended: 1000ms for industrial applications)
          </p>
        </div>
      </div>

      {/* RECONNECT */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Reconnect</h2>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={form.reconnect_enable}
            onChange={(e) => update("reconnect_enable", e.target.checked)}
            disabled={loading}
          />
          <span className="text-sm">Enable automatic reconnection on connection loss</span>
        </div>

        {form.reconnect_enable && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Min Delay (ms)</label>
              <input
                type="number"
                value={form.reconnect_min_delay}
                onChange={(e) => update("reconnect_min_delay", Number(e.target.value))}
                className="w-full border p-2 rounded"
                min="100"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Initial retry delay</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Max Delay (ms)</label>
              <input
                type="number"
                value={form.reconnect_max_delay}
                onChange={(e) => update("reconnect_max_delay", Number(e.target.value))}
                className="w-full border p-2 rounded"
                min="1000"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum retry delay (exponential backoff)</p>
            </div>
          </div>
        )}
      </div>

      {/* BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices")}
        onNext={handleSave}
        nextLabel={loading ? "Guardando..." : "Guardar"}
        nextClassName="bg-green-600 hover:bg-green-700 text-white"
        nextDisabled={loading || form.name.trim() === "" || form.hostname.trim() === ""}
      />
    </div>
  );
};

export default EditSnap7ConfigPage;
