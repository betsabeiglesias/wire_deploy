//frontend\src\modules\organizarScada\components\canvas\EditorToolbar.jsx
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function EditorToolbar({
  sidebarOpen,
  onToggleSidebar,
  isLiveMode,
  onToggleLive,
}) {
  return (
    <div className="flex items-center px-3 py-2 border-b bg-white">

      {/* Sidebar */}
      <button onClick={onToggleSidebar} className="p-2 hover:bg-slate-100 rounded">
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      <div className="flex-1" />

      {/* Play */}
      <button
        onClick={onToggleLive}
        className={`px-3 py-1 rounded-lg text-white ${
          isLiveMode ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {isLiveMode ? "Stop" : "Play"}
      </button>
    </div>
  );
}