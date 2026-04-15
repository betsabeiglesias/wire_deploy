import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button";

const ConfigurarComunicacionesButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/devices")}
      variant="secondary"
      className={className}
    >
      Configurar comunicaciones
    </Button>
  );
};

export default ConfigurarComunicacionesButton;
