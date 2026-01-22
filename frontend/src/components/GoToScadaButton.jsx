import React from "react";
import { useNavigate } from "react-router-dom";

const GoToScadaButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/scada");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors cursor-pointer"
    >
      Volver a SCADA
    </button>
  );
};

export default GoToScadaButton;
