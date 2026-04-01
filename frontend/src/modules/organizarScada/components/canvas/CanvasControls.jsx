// frontend\src\modules\organizarScada\components\canvas\CanvasControls.jsx
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

        <button onClick={onZoomOut} className="px-2 py-1 rounded hover:bg-slate-100">-</button>

        <button onClick={onResetZoom} className="min-w-[50px] text-center hover:bg-slate-100 rounded px-2 py-1">
          {zoomLabel}
        </button>

        <button onClick={onZoomIn} className="px-2 py-1 rounded hover:bg-slate-100">+</button>

        <div className="w-px h-4 bg-slate-200" />

        <button onClick={onFitToScreen} className="px-2 py-1 rounded hover:bg-slate-100">
          Ajustar
        </button>
      </div>
    </div>
  );
}