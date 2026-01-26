// docker-suite/frontend/src/modules/scada/pages/Snap7ConfigPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";

const Snap7ConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // General
    name: "",
    description: "",
    enabled: false,

    // Connection
    hostname: "",
    rack: 0,
    slot: 1,

    // Timeouts
    timeout_ms: 5000,
    
    // PDU Size (S7 específico)
    pdu_size: 480,

    // Polling
    poll_ms: 1000,

    // Reconnect
    reconnect_enable: true,
    reconnect_min_delay: 1000,
    reconnect_max_delay: 60000,
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    console.log("Snap7 config:", form);
    navigate("/devices/new/isa95", { 
      state: { 
        from: "snap7",
        connection: form
      } 
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Configure Siemens S7 Device</h1>

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
          <label className="block text-sm font-medium">Hostname / IP Address</label>
          <input
            value={form.hostname}
            onChange={(e) => update("hostname", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="10.100.100.200"
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
              />
              <p className="text-xs text-gray-500 mt-1">Maximum retry delay (exponential backoff)</p>
            </div>
          </div>
        )}
      </div>

      {/* WIZARD BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices/new")}
        onNext={handleNext}
        nextDisabled={
          form.name.trim() === "" ||
          form.hostname.trim() === ""
        }
      />
    </div>
  );
};

export default Snap7ConfigPage;