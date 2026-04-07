export default function CanvasControls({
  zoomLabel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
}) {
  return (
    <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-md text-xs">

        <button
          onClick={onZoomOut}
          className="px-2 py-1 rounded cursor-pointer transition hover:bg-slate-100 active:scale-95"
        >
          -
        </button>

        <button
          onClick={onResetZoom}
          className="min-w-[50px] text-center px-2 py-1 rounded cursor-pointer transition hover:bg-slate-100 active:scale-95"
        >
          {zoomLabel}
        </button>

        <button
          onClick={onZoomIn}
          className="px-2 py-1 rounded cursor-pointer transition hover:bg-slate-100 active:scale-95"
        >
          +
        </button>

        <div className="w-px h-4 bg-slate-200" />

        <button
          onClick={onFitToScreen}
          className="px-2 py-1 rounded cursor-pointer transition hover:bg-slate-100 active:scale-95"
        >
          Ajustar
        </button>

      </div>
    </div>
  );
}