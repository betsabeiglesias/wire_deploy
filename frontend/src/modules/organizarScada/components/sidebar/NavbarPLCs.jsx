// src/modules/organizarScada/components/sidebar/NavbarPLCs.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

export default function NavbarPLCs({ toolbar }) {
  const fileRef = useRef(null);
  const show = toolbar?.showActions;
  const navigate = useNavigate();

  const baseButtonClass =
    "rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.05)] text-[#101f3a] hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.12)]";
  const accentButtonClass =
    "rounded-xl border border-[#2d6284] bg-[linear-gradient(180deg,#215f82_0%,#194b68_100%)] text-white shadow-[0_16px_28px_-20px_rgba(25,75,104,0.75)] hover:brightness-110";
  const successButtonClass =
    "rounded-xl border border-[rgba(126,200,255,0.35)] bg-[linear-gradient(180deg,#255f82_0%,#1c4f6d_100%)] text-white shadow-[0_16px_28px_-20px_rgba(28,79,109,0.75)] hover:brightness-110";

  return (
    <header className="relative flex min-h-[58px] items-center justify-between border-b border-[#1f3656] bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_42%,#132857_100%)] px-4 py-2 text-[#d6e4f5] shadow-[0_20px_36px_-28px_rgba(3,10,24,0.8)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,200,255,0.14),transparent_28%)]" />

      <div className="relative flex items-center gap-3">
        <Button
          variant="secondary"
          className={baseButtonClass}
          onClick={() => navigate("/")}
        >
          Home
        </Button>
        <Button
          variant="secondary"
          className={baseButtonClass}
          onClick={() => navigate("/layout")}
          title="Volver a SCADA"
        >
          Mis HMIs
        </Button>
      </div>

      {show && (
        <div className="relative mr-2 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            className={baseButtonClass}
            onClick={toolbar.onNewDashboard}
            title="Crear un nuevo proyecto desde cero"
          >
            Nuevo
          </Button>

          <Button
            variant="secondary"
            className={accentButtonClass}
            onClick={toolbar.onLoadFromDB}
            title="Abrir un proyecto guardado"
          >
            Mis proyectos
          </Button>

          <Button
            variant="secondary"
            className={baseButtonClass}
            onClick={toolbar.onClear}
            title="Vaciar lienzo"
          >
            Limpiar
          </Button>

          <Button
            variant="secondary"
            className={baseButtonClass}
            onClick={toolbar.onExport}
            title="Exportar JSON local"
          >
            Exportar
          </Button>

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
            className={baseButtonClass}
            onClick={() => fileRef.current?.click()}
            title="Importar JSON local"
          >
            Importar
          </Button>

          <Button
            variant="secondary"
            className={successButtonClass}
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
