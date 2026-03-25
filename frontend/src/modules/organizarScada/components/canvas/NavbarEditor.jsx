// src/modules/organizarScada/components/canvas/NavbarEditor.jsx
import React from "react";

export default function NavbarEditor({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  zoomLabel = "100%",
  onDuplicate,
  onDeleteSelected,
  showProps,
  onToggleProps,
  // ── Live mode ──────────────────────────────────────────────────────────────
  isLiveMode = false,
  onToggleLive,
  onOpenScript,
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm text-[12px] text-slate-700 flex-wrap">

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut}  className="px-2 py-1 rounded hover:bg-slate-100">Zoom -</button>
        <button onClick={onZoomIn}   className="px-2 py-1 rounded hover:bg-slate-100">Zoom +</button>
        <button onClick={onResetZoom} className="px-2 py-1 rounded hover:bg-slate-100 min-w-[52px] text-center">{zoomLabel}</button>
        <button onClick={onFitToScreen} className="px-2 py-1 rounded hover:bg-slate-100">Ajustar</button>
      </div>

      <div className="h-4 w-px bg-slate-200" />

      {/* Widget controls — deshabilitados en modo live */}
      {!isLiveMode && (
        <>
          <button onClick={onDuplicate}     className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40" disabled={isLiveMode}>Duplicar</button>
          <button onClick={onDeleteSelected} className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40" disabled={isLiveMode}>Eliminar</button>
          <button onClick={onOpenScript} className="px-2 py-1 rounded hover:bg-slate-100">Script</button>

          <div className="h-4 w-px bg-slate-200" />

          <button onClick={onToggleProps}
            className={[
              "px-2 py-1 rounded",
              showProps ? "bg-sky-100 text-sky-700" : "hover:bg-slate-100",
            ].join(" ")}>
            {showProps ? "Ocultar props" : "Mostrar props"}
          </button>

          <div className="h-4 w-px bg-slate-200" />
        </>
      )}

      {/* ── PLAY / STOP ─────────────────────────────────────────────────── */}
      <button
        onClick={onToggleLive}
        className={[
          "flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all",
          isLiveMode
            ? "bg-rose-500 text-white hover:bg-rose-600 shadow"
            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow",
        ].join(" ")}
        title={isLiveMode ? "Detener tiempo real" : "Activar tiempo real"}
      >
        {isLiveMode ? (
          <>
            <span className="h-2.5 w-2.5 rounded-sm bg-white inline-block" />
            Stop
          </>
        ) : (
          <>
            {/* Triángulo play */}
            <svg className="h-3 w-3 fill-white" viewBox="0 0 10 10">
              <polygon points="1,0 9,5 1,10" />
            </svg>
            Play
          </>
        )}
      </button>

    </div>
  );
}

