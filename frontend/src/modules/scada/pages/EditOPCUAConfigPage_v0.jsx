// docker-suite/frontend/src/modules/scada/pages/EditOPCUAConfigPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPLC, updatePLC } from "../api/plcApi";
import { markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";
import WizardNavigation from "../components/WizardNavigationButton";

const EditOPCUAConfigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,
    endpoint: "",
    namespace_uri: "",
    security_mode: "None",
    security_policy: "None",
    timeout_connect: 5000,
    timeout_session: 10000,
    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 10000,
    publishing_interval_ms: 500,
    sampling_interval_ms: 200,
    queue_size: 10,
    discard_oldest: true,
    watchdog_ms: 4000,
    debounce_ms: 3000,
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
          endpoint: plc.connection_data?.endpoint || "",
          namespace_uri: plc.connection_data?.namespace_uri || "",
          security_mode: plc.connection_data?.security_mode || "None",
          security_policy: plc.connection_data?.security_policy || "None",
          timeout_connect: plc.connection_data?.timeouts_ms?.connect ?? 5000,
          timeout_session: plc.connection_data?.timeouts_ms?.session ?? 10000,
          reconnect_enable: plc.connection_data?.reconnect?.enable ?? true,
          reconnect_min_delay: plc.connection_data?.reconnect?.min_delay_ms ?? 1000,
          reconnect_max_delay: plc.connection_data?.reconnect?.max_delay_ms ?? 10000,
          publishing_interval_ms: plc.connection_data?.subscription?.publishing_interval_ms ?? 500,
          sampling_interval_ms: plc.connection_data?.subscription?.sampling_interval_ms ?? 200,
          queue_size: plc.connection_data?.subscription?.queue_size ?? 10,
          discard_oldest: plc.connection_data?.subscription?.discard_oldest ?? true,
          watchdog_ms: plc.connection_data?.subscription?.watchdog_ms ?? 4000,
          debounce_ms: plc.connection_data?.subscription?.debounce_ms ?? 3000,
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
    if (!form.name.trim() || !form.endpoint.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "El nombre y endpoint son requeridos",
      });
    }

    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      enabled: form.enabled,
      driver: immutableFields.driver,
      work_unit: immutableFields.work_unit,
      connection_string: form.endpoint,
      connection_data: {
        endpoint: form.endpoint,
        namespace_uri: form.namespace_uri,
        security_mode: form.security_mode,
        security_policy: form.security_policy,
        timeouts_ms: {
          connect: form.timeout_connect,
          session: form.timeout_session,
        },
        reconnect: {
          enable: form.reconnect_enable,
          min_delay_ms: form.reconnect_min_delay,
          max_delay_ms: form.reconnect_max_delay,
        },
        subscription: {
          publishing_interval_ms: form.publishing_interval_ms,
          sampling_interval_ms: form.sampling_interval_ms,
          queue_size: form.queue_size,
          discard_oldest: form.discard_oldest,
          watchdog_ms: form.watchdog_ms,
          debounce_ms: form.debounce_ms,
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
      <h1 className="text-3xl font-semibold mb-6">Editar Dispositivo OPC UA</h1>

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
            placeholder="OPCUA_EBW01"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="OPC UA gateway for EBW line"
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
          <label className="block text-sm font-medium">Endpoint URL</label>
          <input
            value={form.endpoint}
            onChange={(e) => update("endpoint", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="opc.tcp://host:4840/server"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Namespace URI</label>
          <input
            value={form.namespace_uri}
            onChange={(e) => update("namespace_uri", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="http://my-namespace.local"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium">Security Mode</label>
            <select
              value={form.security_mode}
              onChange={(e) => update("security_mode", e.target.value)}
              className="w-full border p-2 rounded"
              disabled={loading}
            >
              <option>None</option>
              <option>Sign</option>
              <option>SignAndEncrypt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Security Policy</label>
            <select
              value={form.security_policy}
              onChange={(e) => update("security_policy", e.target.value)}
              className="w-full border p-2 rounded"
              disabled={loading}
            >
              <option>None</option>
              <option>Basic256</option>
              <option>Basic256Sha256</option>
              <option>AES128_Sha256_RsaOaep</option>
            </select>
          </div>
        </div>

        {/* TIMEOUTS */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Connect Timeout (ms)</label>
            <input
              type="number"
              value={form.timeout_connect}
              onChange={(e) => update("timeout_connect", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Session Timeout (ms)</label>
            <input
              type="number"
              value={form.timeout_session}
              onChange={(e) => update("timeout_session", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>
        </div>

        {/* RECONNECT */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Reconnect</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={form.reconnect_enable}
              onChange={(e) => update("reconnect_enable", e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm">Enable reconnect</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Min delay (ms)</label>
              <input
                type="number"
                value={form.reconnect_min_delay}
                onChange={(e) => update("reconnect_min_delay", Number(e.target.value))}
                className="w-full border p-2 rounded"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Max delay (ms)</label>
              <input
                type="number"
                value={form.reconnect_max_delay}
                onChange={(e) => update("reconnect_max_delay", Number(e.target.value))}
                className="w-full border p-2 rounded"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Subscription</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Publishing interval (ms)</label>
            <input
              type="number"
              value={form.publishing_interval_ms}
              onChange={(e) => update("publishing_interval_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Sampling interval (ms)</label>
            <input
              type="number"
              value={form.sampling_interval_ms}
              onChange={(e) => update("sampling_interval_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Queue size</label>
            <input
              type="number"
              value={form.queue_size}
              onChange={(e) => update("queue_size", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.discard_oldest}
              onChange={(e) => update("discard_oldest", e.target.checked)}
              disabled={loading}
            />
            <span>Discard oldest</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Watchdog (ms)</label>
            <input
              type="number"
              value={form.watchdog_ms}
              onChange={(e) => update("watchdog_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Debounce (ms)</label>
            <input
              type="number"
              value={form.debounce_ms}
              onChange={(e) => update("debounce_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices")}
        onNext={handleSave}
        nextLabel={loading ? "Guardando..." : "Guardar"}
        nextClassName="bg-green-600 hover:bg-green-700 text-white"
        nextDisabled={loading || form.name.trim() === "" || form.endpoint.trim() === ""}
      />
    </div>
  );
};

export default EditOPCUAConfigPage;
