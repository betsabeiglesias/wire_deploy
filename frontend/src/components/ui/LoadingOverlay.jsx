import React from "react";

/**
 * Capa semitransparente para mostrar estados de carga bloqueantes.
 * Reutilizable en cualquier flujo que necesite impedir interacción mientras se resuelven peticiones.
 */
const LoadingOverlay = ({ message = "Cargando..." }) => (
  <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
    <div className="flex items-center gap-3 rounded-xl bg-white/90 px-5 py-3 shadow-xl border border-slate-200">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
      <p className="text-slate-700 font-medium">{message}</p>
    </div>
  </div>
);

export default LoadingOverlay;
