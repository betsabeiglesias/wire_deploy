// docker-suite\frontend\src\modules\scada\pages\CreateNewDeviceButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const CreateNewDeviceButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/devices/new");
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-600 hover:underline cursor-pointer"
    >
      → Create new device...
    </button>
  );
};

export default CreateNewDeviceButton;