// src/modules/organizarScada/components/sidebar/NavbarPLCs.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

export default function NavbarPLCs({ toolbar }) {
  const fileRef  = useRef(null);
  const show     = toolbar?.showActions;
  const navigate = useNavigate();
  // Función para gestionar la salida descartando cambios
  const handleCancel = () => {
    const confirmExit = window.confirm(
      "¿Realmente quieres descartar los cambios? No se guardará el trabajo realizado."
    );
    
    if (confirmExit) {
      navigate("/hmi");
    }
  };

  return (
    <header className="h-[50px] flex items-center justify-between px-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Home
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/layout")}
          title="Volver a SCADA"
        >
          Mis HMIs
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate("/hmi")}
          title="Volver a Centro HMI"
        >
          Centro HMI
        </Button>
      </div>

      {show && (
        <div className="flex items-center gap-3 mr-8">

          {/* NUEVO BOTÓN: CANCELAR */}
          <Button
            variant="secondary"
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
            onClick={handleCancel}
            title="Descartar cambios y volver a Centro HMI"
          >
            Descartar
          </Button> 

          <Button
            variant="secondary"
            className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            onClick={toolbar.onNewDashboard}
            title="Crear un nuevo proyecto desde cero"
          >
            Nuevo
          </Button>

          {/* Cargar proyecto desde BD */}
          <Button
            variant="secondary"
            className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
            onClick={toolbar.onLoadFromDB}
            title="Abrir un proyecto guardado"
          >
            Mis proyectos
          </Button>

          <Button
            variant="secondary"
            onClick={toolbar.onClear}
            title="Vaciar lienzo"
          >
            Limpiar
          </Button>

          <Button
            variant="secondary"
            onClick={toolbar.onExport}
            title="Exportar JSON local"
          >
            Exportar
          </Button>

          {/* Importar JSON local */}
          <input
            type="file"
            ref={fileRef}
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) toolbar.onImport(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            title="Importar JSON local"
          >
            Importar
          </Button>

          <Button
            variant="secondary"
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            onClick={toolbar.onPublish}
            title="Guardar en la base de datos"
          >
            Guardar
          </Button>
        </div>
      )}
    </header>
  );
}
