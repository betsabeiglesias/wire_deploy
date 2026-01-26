import React from "react";
import { useNavigate } from "react-router-dom";

const EditLayOutButton = ({ initialLayoutElements, layoutId, layoutName }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/organizar-scada", {
      state: {
        // Reutiliza el flujo de "Editar Scada" para cargar todas las vistas de la app
        loadPublishedId: layoutId,
        layoutId,
        layOutName: layoutName,
        editMode: true,
        // Respaldo local por si falla la carga remota
        initialLayoutElements,
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="
        border border-green-600
        text-green-600
        px-4 py-2
        rounded
        hover:bg-green-50
        hover:text-green-700
        transition-colors
        cursor-pointer
      "
    >
      Editar LayOut
    </button>
  );
};

export default EditLayOutButton;
