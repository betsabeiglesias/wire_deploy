// docker-suite\frontend\src\modules\scada\pages\OPCUAConfigPage.jsx// docker-suite/frontend/src/modules/scada/pages/OPCUAConfigPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";

const OPCUAConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,

    // Connection
    endpoint: "",
    namespace_uri: "",
    security_mode: "None",
    security_policy: "None",

    timeout_connect: 5000,
    timeout_session: 10000,

    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 10000,

    // Subscription
    publishing_interval_ms: 500,
    sampling_interval_ms: 200,
    queue_size: 10,
    discard_oldest: true,
    watchdog_ms: 4000,
    debounce_ms: 3000,
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    console.log("OPC UA config:", form);
    navigate("/devices/new/isa95", {state: { from: "opcua", connection: form}});
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Configure OPC UA Device</h1>

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
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="OPC UA gateway for EBW line"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
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
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Namespace URI</label>
          <input
            value={form.namespace_uri}
            onChange={(e) => update("namespace_uri", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="http://my-namespace.local"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium">Security Mode</label>
            <select
              value={form.security_mode}
              onChange={(e) => update("security_mode", e.target.value)}
              className="w-full border p-2 rounded"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Session Timeout (ms)</label>
            <input
              type="number"
              value={form.timeout_session}
              onChange={(e) => update("timeout_session", Number(e.target.value))}
              className="w-full border p-2 rounded"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Max delay (ms)</label>
              <input
                type="number"
                value={form.reconnect_max_delay}
                onChange={(e) => update("reconnect_max_delay", Number(e.target.value))}
                className="w-full border p-2 rounded"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Sampling interval (ms)</label>
            <input
              type="number"
              value={form.sampling_interval_ms}
              onChange={(e) => update("sampling_interval_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
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
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.discard_oldest}
              onChange={(e) => update("discard_oldest", e.target.checked)}
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Debounce (ms)</label>
            <input
              type="number"
              value={form.debounce_ms}
              onChange={(e) => update("debounce_ms", Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      {/* WIZARD BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices/new")}
        onNext={handleNext}
        nextDisabled={
          form.name.trim() === "" ||
          form.endpoint.trim() === "" ||
          form.slot === ""
        }
      />
    </div>
  );
};

export default OPCUAConfigPage;
