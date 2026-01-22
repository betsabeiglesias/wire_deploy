import React from "react";
import { useNavigate } from "react-router-dom";

const OrganizarScadaButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/organizar-scada");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 px-4 py-2
      border border-green-600
        text-green-600
        rounded
        hover:bg-green-50
        hover:text-green-700
        transition-colors
        cursor-pointer"
      
    >
      Organizar SCADA
    </button>
  );
};

export default OrganizarScadaButton;
