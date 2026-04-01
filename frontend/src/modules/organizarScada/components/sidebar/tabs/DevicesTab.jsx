// tabs/DevicesTab.jsx
//
// Sección "Dispositivos" del sidebar: árbol tabla → variables + botón gestor.
// Extraído de UnifiedSidebar.renderSectionContent("devices").
//
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

const cls = (...parts) => parts.filter(Boolean).join(" ");

const DevicesTab = ({
  layoutId,
  projectNameDraft,
  setProjectNameDraft,
  onProjectNameChange,
  onSaveProject,
  isSavingProject,
  setIsSavingProject,
  commitProjectName,
  // Variables
  variables,
  varsLoading,
  totalVarsCount,
  expandedTables,
  toggleTable,
  // Gestor modal
  onOpenDeviceManager,
}) => {
  // ── Sin proyecto guardado: formulario de nombre ───────────────────────────
  if (!layoutId) {
    return (
      <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3 text-[11px] space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Variables</h3>
        <p className="text-[10px] text-slate-500">
          Para gestionar variables el proyecto necesita un nombre y estar guardado.
        </p>
        <div className="space-y-2">
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-[12px] focus:border-sky-400 focus:outline-none"
            placeholder="Nombre del proyecto…"
            value={projectNameDraft}
            onChange={(e) => setProjectNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitProjectName();
            }}
          />
          <button
            type="button"
            disabled={!projectNameDraft.trim() || isSavingProject}
            onClick={async () => {
              const name = projectNameDraft.trim();
              if (!name) return;
              onProjectNameChange?.(name);
              setIsSavingProject(true);
              try {
                await onSaveProject?.(name);
              } finally {
                setIsSavingProject(false);
              }
            }}
            className="w-full rounded border border-sky-400 bg-sky-50 px-2 py-1.5 text-[12px] font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSavingProject ? "Guardando…" : "Guardar y continuar"}
          </button>
        </div>
      </div>
    );
  }

  // ── Con proyecto guardado: árbol tabla → variables ────────────────────────
  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3 text-[11px] space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Variables
          {totalVarsCount > 0 && (
            <span className="ml-1.5 text-[10px] font-normal text-slate-400">
              ({totalVarsCount})
            </span>
          )}
        </h3>
        <button
          onClick={onOpenDeviceManager}
          className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
        >
          Gestionar
        </button>
      </div>

      {varsLoading ? (
        <div className="space-y-1 pt-1">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} width="w-full" height="h-4" />
          ))}
        </div>
      ) : variables.length === 0 ? (
        <p className="text-[10px] text-slate-400">
          Sin tablas. Usa "Gestionar" para crear tablas y añadir variables.
        </p>
      ) : (
        <div className="space-y-0.5 max-h-72 overflow-y-auto">
          {variables.map((table) => {
            const isOpen = expandedTables[table.id] ?? true;
            const tableVars = table.variables || [];
            return (
              <div key={table.id}>
                {/* Tabla — rama */}
                <button
                  type="button"
                  onClick={() => toggleTable(table.id)}
                  className="flex w-full items-center gap-1 rounded px-1 py-1 hover:bg-slate-100 text-left"
                >
                  {isOpen ? (
                    <ChevronDown size={11} className="shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight size={11} className="shrink-0 text-slate-400" />
                  )}
                  <span className="flex-1 text-[11px] font-semibold text-slate-700 truncate">
                    {table.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">{tableVars.length}</span>
                </button>

                {/* Variables — hojas */}
                {isOpen && (
                  <div className="ml-3 border-l border-slate-300/60 pl-2 space-y-0.5 pb-1">
                    {tableVars.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-0.5">Sin variables.</p>
                    ) : (
                      tableVars.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between gap-1 rounded px-1 py-0.5 hover:bg-slate-50"
                          title={
                            v.source === "connection"
                              ? `${v.equipment} › ${v.variable}`
                              : `Local · ${v.datatype}${v.initial_value != null ? ` = ${v.initial_value}` : ""}`
                          }
                        >
                          <span className="truncate text-[11px] text-slate-700">{v.name}</span>
                          <div className="flex shrink-0 items-center gap-1">
                            {v.source === "connection" && v.equipment && (
                              <span className="text-[9px] text-slate-400 truncate max-w-[60px]">
                                {v.equipment}
                              </span>
                            )}
                            <span
                              className={cls(
                                "rounded px-1 text-[9px]",
                                v.source === "local"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {v.datatype || "—"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DevicesTab;
