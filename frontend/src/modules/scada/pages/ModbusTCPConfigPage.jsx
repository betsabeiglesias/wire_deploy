// docker-suite/frontend/src/modules/scada/pages/ModbusTCPConfigPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "@/components/WizardNavigationButton";

const ModbusTCPConfigPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    enabled: false,

    // Connection
    host: "",
    port: 502,
    poll_rate_ms: 500,

    // Default Modbus format for all items
    byte_order: "big",
    word_order: "little",
  });

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    console.log("Modbus TCP config:", form);
    navigate("/devices/new/isa95", { state: { from: "modbus", connection: form } });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Configure Modbus TCP Device</h1>

      {/* GENERAL */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">General</h2>

        <p className="text-sm text-gray-600 mb-4">
          The <strong>technical identifier</strong> should be unique and independent from ISA-95 structure.
        </p>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Name (Technical Identifier)</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="ModbusPLC01"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Power meter on line 1"
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

        {/* Host */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Host / IP</label>
          <input
            value={form.host}
            onChange={(e) => update("host", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="192.168.100.94"
          />
        </div>

        {/* Port */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Port</label>
          <input
            type="number"
            value={form.port}
            onChange={(e) => update("port", Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Poll rate */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Poll rate (ms)</label>
          <input
            type="number"
            value={form.poll_rate_ms}
            onChange={(e) => update("poll_rate_ms", Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* MODBUS FORMAT */}
      <div className="border rounded bg-gray-100 px-4 py-3 mb-6">
        <h2 className="text-xl font-semibold mb-2">Default Modbus Format</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Byte order */}
          <div>
            <label className="block text-sm font-medium">Byte Order</label>
            <select
              value={form.byte_order}
              onChange={(e) => update("byte_order", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="big">Big Endian</option>
              <option value="little">Little Endian</option>
            </select>
          </div>

          {/* Word order */}
          <div>
            <label className="block text-sm font-medium">Word Order</label>
            <select
              value={form.word_order}
              onChange={(e) => update("word_order", e.target.value)}
              className="w-full border p-2 rounded"
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

      {/* WIZARD BUTTONS */}
      <WizardNavigation
        onBack={() => navigate("/devices/new")}
        onNext={handleNext}
        nextDisabled={
          form.name.trim() === "" ||
          form.host.trim() === ""
        }
      />
    </div>
  );
};

export default ModbusTCPConfigPage;
