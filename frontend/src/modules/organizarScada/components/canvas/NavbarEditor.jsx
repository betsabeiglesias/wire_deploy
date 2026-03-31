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
  isLiveMode = false,
  onToggleLive,
  onOpenScript,
}) {
  const ghostButtonClass =
    "rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-[#d6e4f5] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.12)]";
  const activeButtonClass =
    "rounded-xl border border-[#7ec8ff] bg-[rgba(126,200,255,0.16)] px-2.5 py-1.5 text-[#eef4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-[#1f3656] bg-[linear-gradient(180deg,rgba(9,21,47,0.96)_0%,rgba(13,29,64,0.98)_100%)] px-3 py-2 text-[12px] text-[#d6e4f5] shadow-[0_24px_48px_-30px_rgba(3,10,24,0.82)] backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className={ghostButtonClass}>
          Zoom -
        </button>
        <button onClick={onZoomIn} className={ghostButtonClass}>
          Zoom +
        </button>
        <button onClick={onResetZoom} className={activeButtonClass}>
          <span className="inline-block min-w-[52px] text-center">
            {zoomLabel}
          </span>
        </button>
        <button onClick={onFitToScreen} className={ghostButtonClass}>
          Ajustar
        </button>
      </div>

      <div className="h-5 w-px bg-[rgba(255,255,255,0.12)]" />

      {!isLiveMode && (
        <>
          <button
            onClick={onDuplicate}
            className={`${ghostButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
            disabled={isLiveMode}
          >
            Duplicar
          </button>
          <button
            onClick={onDeleteSelected}
            className={`${ghostButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
            disabled={isLiveMode}
          >
            Eliminar
          </button>
          <button onClick={onOpenScript} className={ghostButtonClass}>
            Script
          </button>

          <div className="h-5 w-px bg-[rgba(255,255,255,0.12)]" />

          <button
            onClick={onToggleProps}
            className={showProps ? activeButtonClass : ghostButtonClass}
          >
            {showProps ? "Ocultar props" : "Mostrar props"}
          </button>

          <div className="h-5 w-px bg-[rgba(255,255,255,0.12)]" />
        </>
      )}

      <button
        onClick={onToggleLive}
        className={[
          "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-all",
          isLiveMode
            ? "border-[rgba(241,153,173,0.35)] bg-[linear-gradient(180deg,#af4761_0%,#92364f_100%)] text-white shadow-[0_16px_28px_-20px_rgba(175,71,97,0.75)] hover:brightness-110"
            : "border-[rgba(126,200,255,0.35)] bg-[linear-gradient(180deg,#215f82_0%,#194b68_100%)] text-white shadow-[0_16px_28px_-20px_rgba(25,75,104,0.75)] hover:brightness-110",
        ].join(" ")}
        title={isLiveMode ? "Detener tiempo real" : "Activar tiempo real"}
      >
        {isLiveMode ? (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-white" />
            Stop
          </>
        ) : (
          <>
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
