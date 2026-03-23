import React from "react";

export default function NavbarEditor({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  zoomLabel,
  onDuplicate,
  onDeleteSelected,
  showProps = true,
  onToggleProps,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onZoomIn}
          title="Zoom In"
          type="button"
        >
          Zoom +
        </button>
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onZoomOut}
          title="Zoom Out"
          type="button"
        >
          Zoom -
        </button>
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onResetZoom}
          title="Reset Zoom"
          type="button"
        >
          100%
        </button>
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onFitToScreen}
          title="Ajustar al contenedor"
          type="button"
        >
          Ajustar
        </button>
        <span className="text-xs text-slate-500">{zoomLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onDuplicate}
          title="Duplicar seleccionado"
          type="button"
        >
          Duplicar
        </button>
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
          onClick={onDeleteSelected}
          title="Eliminar seleccionado"
          type="button"
        >
          Eliminar
        </button>
        {onToggleProps && (
          <button
            className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
            onClick={onToggleProps}
            title="Mostrar/Ocultar Propiedades"
            type="button"
          >
            {showProps ? "Ocultar props" : "Mostrar props"}
          </button>
        )}
      </div>
    </div>
  );
}
