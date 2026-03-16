// src/modules/organizarScada/components/sidebar/NavbarPLCs.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "@/components/HomeButton";

export default function NavbarPLCs({ toolbar }) {
  const fileRef  = useRef(null);
  const show     = toolbar?.showActions;
  const navigate = useNavigate();

  return (
    <header className="h-[50px] flex items-center justify-between px-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-6">
        <HomeButton />
        <button
          className="px-3 py-1.5 rounded border hover:bg-gray-50"
          onClick={() => navigate("/layout")}
          title="Volver a SCADA"
        >
          Mis HMIs
        </button>
      </div>

      {show && (
        <div className="flex items-center gap-3 mr-8">
          <button
            className="px-3 py-1.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium"
            onClick={toolbar.onNewDashboard}
            title="Crear un nuevo proyecto desde cero"
          >
            Nuevo
          </button>

          {/* Cargar proyecto desde BD */}
          <button
            className="px-3 py-1.5 rounded border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium"
            onClick={toolbar.onLoadFromDB}
            title="Abrir un proyecto guardado"
          >
            Mis proyectos
          </button>

          <button
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
            onClick={toolbar.onClear}
            title="Vaciar lienzo"
          >
            Limpiar
          </button>

          <button
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
            onClick={toolbar.onExport}
            title="Exportar JSON local"
          >
            Exportar
          </button>

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
          <button
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
            onClick={() => fileRef.current?.click()}
            title="Importar JSON local"
          >
            Importar
          </button>

          <button
            className="px-3 py-1.5 rounded border bg-green-50 text-green-700 hover:bg-green-100 font-medium"
            onClick={toolbar.onPublish}
            title="Guardar en la base de datos"
          >
            Guardar
          </button>
        </div>
      )}
    </header>
  );
}
