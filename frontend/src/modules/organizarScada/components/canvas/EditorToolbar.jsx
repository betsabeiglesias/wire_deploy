//frontend\src\modules\organizarScada\components\canvas\EditorToolbar.jsx
import { Play, Square } from "lucide-react";

export default function EditorToolbar({
  isLiveMode,
  onToggleLive,
}) {
  const Icon = isLiveMode ? Square : Play;

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      <button
        onClick={onToggleLive}
        title={isLiveMode ? "Salir de vista en vivo" : "Activar vista en vivo"}
        className={`h-8 cursor-pointer rounded-[4px] border px-3 text-[11px] font-medium shadow-sm transition-colors active:scale-95 flex items-center gap-1.5 ${
          isLiveMode
            ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            : "border-[#29468B] bg-[#29468B] text-white hover:bg-[#1F3A73]"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{isLiveMode ? "Stop Run Time" : "Run Time"}</span>
      </button>
    </div>
  );
}

