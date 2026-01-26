// docker-suite\frontend\src\modules\scada\pages\CreateDevicePage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardNavigation from "../components/WizardNavigationButton";

const CreateDevicePage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const drivers = [
    {
      id: "snap7",
      title: "Siemens Snap7",
      description: "Conexión a Siemens PLCs vía protocolo Snap7.",
    },
    {
      id: "modbus",
      title: "Modbus TCP",
      description: "Conexión a dispositivos vía protocolo Modbus TCP.",
    },
    {
      id: "opcua",
      title: "OPC UA",
      description: "Conexión a dispositivos vía protocolo OPC UA.",
    },
  ];

  const handleNext = () => {
    if (!selected) return;
    navigate(`/devices/new/${selected}`, {state: {from: selected}});
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Select Communication Driver</h1>

      <div className="space-y-4">
        {drivers.map((driver) => (
          <label
            key={driver.id}
            className={`block border rounded p-4 cursor-pointer hover:bg-gray-50 ${
              selected === driver.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                name="driver"
                value={driver.id}
                checked={selected === driver.id}
                onChange={() => setSelected(driver.id)}
                className="mt-1 mr-3"
              />
              <div>
                <p className="text-lg font-medium">{driver.title}</p>
                <p className="text-gray-600">{driver.description}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6">
        < WizardNavigation
          onBack={() => navigate("/devices")}
          onNext={handleNext}
          nextDisabled={!selected}
        />
       </div>
    </div>
  );
};

export default CreateDevicePage;
