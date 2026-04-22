// frontend\src\modules\organizarScada\components\layout\EditorLayout.jsx
import CanvasEditor from "../canvas/CanvasEditor";
import CanvasControls from "../canvas/CanvasControls";
import EditorToolbar from "../canvas/EditorToolbar";

export default function EditorLayout(props) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <CanvasEditor {...props} />
        </div>

        {/* Controles flotantes del canvas */}
        <div className="absolute inset-0 z-50 pointer-events-none">
          <EditorToolbar
            isLiveMode={props.isLiveMode}
            onToggleLive={props.onToggleLive}
          />
          <CanvasControls
            zoomLabel={props.zoomLabel}
            onZoomIn={props.onZoomIn}
            onZoomOut={props.onZoomOut}
            onResetZoom={props.onResetZoom}
            onFitToScreen={props.onFitToScreen}
          />
        </div>
      </div>
    </div>
  );
}
