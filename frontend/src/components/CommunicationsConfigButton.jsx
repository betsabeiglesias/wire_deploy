// docker-suite\frontend\src\modules\scada\components\CommunicationsConfigButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const ConfigurarComunicacionesButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/devices");
  };

  return (
    <button
      onClick={handleClick}
      className="
      fixed top-8 left-4 z-50
      px-4 py-2
      border border-blue-600
        text-blue-600
        rounded
        hover:bg-blue-50
        hover:text-blue-700
        transition-colors
        cursor-pointer"
    >
      Configurar comunicaciones
    </button>
  );
};

export default ConfigurarComunicacionesButton;
