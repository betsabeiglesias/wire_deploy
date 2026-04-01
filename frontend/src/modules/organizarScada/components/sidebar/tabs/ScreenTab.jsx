// tabs/ScreenTab.jsx
//
// Sección "Pantallas" + "Capas" del sidebar.
// Extraído de UnifiedSidebar.renderSectionContent("pantallas").
//
import React, { useState } from "react";
import { Eye, EyeOff, Lock, Unlock, GripVertical } from "lucide-react";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

const ScreenTab = ({
  views,
  selectedViewId,
  onCreateView,
  onSelectView,
  onRenameView,
  onDeleteView,
  onRefreshViews,
  viewsLoading,
  viewsError,
  // Layers
  layers,
  selectedElementId,
  onSelectElement,
  onToggleElementVisibility,
  onToggleElementLock,
  // Layer rename
  editingLayerId,
  editingLayerName,
  setEditingLayerName,
  startLayerRename,
  commitLayerRename,
  cancelLayerRename,
  // Layer drag
  draggingLayerId,
  handleLayerDragStart,
  handleLayerDrop,
}) => {
  // ── View inline rename (local) ────────────────────────────────────────────
  const [editingViewId, setEditingViewId] = useState(null);
  const [editingName,   setEditingName]   = useState("");

  const startInlineRename = (view) => {
    setEditingViewId(view.id);
    setEditingName(view.name);
  };
  const commitInlineRename = (viewId) => {
    if (editingName?.trim()) onRenameView?.(viewId, editingName.trim());
    setEditingViewId(null);
    setEditingName("");
  };
  const cancelInlineRename = () => {
    setEditingViewId(null);
    setEditingName("");
  };

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-100/80 backdrop-blur p-3 text-[11px] space-y-3">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Pantallas</h3>
        <button
          onClick={onCreateView}
          className="inline-flex items-center justify-center rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
        >
          + Nueva pantalla
        </button>
      </div>

      {viewsError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-700">
          {viewsError}
        </div>
      )}

      {/* ── Lista de vistas ─────────────────────────────────────────────────── */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {viewsLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md border border-slate-300/60 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-2">
                  <SkeletonBlock width="w-32" height="h-3.5" />
                  <SkeletonBlock width="w-4" height="h-4" rounded="rounded-full" />
                </div>
                <div className="mt-2">
                  <SkeletonBlock width="w-16" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!viewsLoading && views.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-700">Aún no tienes vistas.</p>
            <p className="mt-1 text-slate-500">Crea tu primera vista o importa un JSON existente.</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onCreateView}
                className="rounded border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:border-sky-400"
              >
                + Crear vista
              </button>
              <button
                onClick={onRefreshViews}
                className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400"
              >
                Reintentar carga
              </button>
            </div>
          </div>
        )}

        {!viewsLoading &&
          views.map((view) => {
            const isSelected = view.id === selectedViewId;
            return (
              <div
                key={view.id}
                className={[
                  "flex items-center justify-between rounded-md border px-3 py-2 transition",
                  isSelected
                    ? "border-sky-400 bg-sky-50"
                    : "border-slate-300/60 bg-slate-50 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start gap-2 w-full">
                  <button onClick={() => onSelectView(view.id)} className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      {editingViewId === view.id ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => commitInlineRename(view.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitInlineRename(view.id);
                            if (e.key === "Escape") cancelInlineRename();
                          }}
                          className="w-full rounded border border-sky-300 px-2 py-1 text-[12px] text-slate-800 focus:outline-none"
                        />
                      ) : (
                        <span className={isSelected ? "text-sky-800 font-semibold" : "text-slate-700"}>
                          {view.name}
                        </span>
                      )}
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {view.elements?.length || 0} elementos
                    </div>
                  </button>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => startInlineRename(view)}
                      className="p-1 text-slate-400 hover:text-sky-600"
                      title="Renombrar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar vista "${view.name}"?`)) onDeleteView(view.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Capas ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-300/60 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Capas
          </h4>
          <span className="text-[10px] text-slate-400">{layers.length} elementos</span>
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-slate-300/60 bg-slate-50 p-1">
          {layers.length === 0 && (
            <div className="rounded bg-slate-50 px-2 py-2 text-[10px] text-slate-500">
              No hay elementos en el canvas.
            </div>
          )}
          {layers.map((layer) => {
            const isSelected = selectedElementId === layer.id;
            const isEditing  = editingLayerId === layer.id;
            return (
              <div
                key={layer.id}
                draggable
                onDragStart={(e) => handleLayerDragStart(e, layer.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleLayerDrop(layer.id)}
                onClick={() => onSelectElement?.(layer.id)}
                className={[
                  "group flex items-center gap-1 rounded border px-1.5 py-1 text-[11px] transition cursor-pointer",
                  isSelected
                    ? "border-sky-400 bg-sky-50 text-sky-900"
                    : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-300",
                  draggingLayerId === layer.id ? "opacity-60" : "",
                ].join(" ")}
                title={`${layer.fallbackName} • z:${layer.zIndex}`}
              >
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleElementVisibility?.(layer.id);
                  }}
                >
                  {layer.isVisible ? (
                    <Eye size={12} />
                  ) : (
                    <EyeOff size={12} className="text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleElementLock?.(layer.id);
                  }}
                >
                  {layer.isLocked ? (
                    <Lock size={12} />
                  ) : (
                    <Unlock size={12} className="text-slate-400" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingLayerName}
                      onChange={(e) => setEditingLayerName(e.target.value)}
                      onBlur={() => commitLayerRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitLayerRename(layer.id);
                        if (e.key === "Escape") cancelLayerRename();
                      }}
                      className="w-full rounded border border-sky-300 px-1 py-0.5 text-[11px] focus:outline-none"
                    />
                  ) : (
                    <p
                      className={[
                        "truncate",
                        !layer.isVisible ? "text-slate-400 line-through" : "",
                        layer.isLocked ? "text-amber-700" : "",
                      ].join(" ")}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startLayerRename(layer);
                      }}
                    >
                      {layer.displayName}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">z:{layer.zIndex}</span>
                <span className="text-slate-300 group-hover:text-slate-500">
                  <GripVertical size={12} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScreenTab;
