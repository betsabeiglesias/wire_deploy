// SidebarPropiedades.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";

const SidebarPropiedades = ({
  isOpen = true,
  selectedElement,
  onChange,
  views = [],
  selectedViewId,
  onSelectView,
  onCreateView,
  onRenameView,
  onDeleteView,
  viewsLoading = false,
  viewsError = "",
  onRefreshViews,
  exportName,
  onExportNameChange,
}) => {
  const [activeTab, setActiveTab] = useState("views");
  const { allTags } = useGatewayData();

  // Cambia autom·ticamente la pestaÒa seg˙n haya elemento seleccionado
  useEffect(() => {
    setActiveTab(selectedElement ? "props" : "views");
  }, [selectedElement]);

  const uniquePlcVariables = useMemo(() => {
    const variables = allTags.map(tag => tag.variable).filter(Boolean);
    return Array.from(new Set(variables)).sort();
  }, [allTags]);

  if (!isOpen) return null;

  const currentLabel =
    selectedElement?.label ??
    selectedElement?.data?.label ??
    selectedElement?.data?.settings?.attributeLabel;
  const hasLabel = typeof currentLabel !== "undefined";
  const currentTargetView =
    selectedElement?.targetViewId ||
    selectedElement?.data?.targetViewId ||
    selectedElement?.data?.settings?.targetViewId ||
    "";
  const currentType = selectedElement?.data?.type || selectedElement?.type;
  const currentSettings = selectedElement?.data?.settings || {};

  const renderViewsSection = () => (
      <div className="space-y-4">
        <div className="rounded border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Nombre dashboard
          </p>
          <input
            type="text"
            value={exportName || ""}
            onChange={(e) => onExportNameChange?.(e.target.value)}
            placeholder="Nombre de la aplicación"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px] focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Vistas
        </h3>
        <button
          onClick={onCreateView}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
        >
          + Nueva
        </button>
      </div>

      {viewsError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-700">
          {viewsError}
        </div>
      )}

      <div className="space-y-2 max-h-56 overflow-y-auto">
          {views.map((view) => {
            const isSelected = view.id === selectedViewId;
            return (
              <div
                key={view.id}
                className={[
                  "rounded-md border px-2 py-2 text-[11px] transition",
                  isSelected
                    ? "border-sky-400 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                  <div>
                    <button
                      className="text-left w-full"
                      onClick={() => onSelectView?.(view.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isSelected
                              ? "text-sky-800 font-semibold"
                              : "text-slate-700"
                          }
                        >
                          {view.name}
                        </span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {view.elements?.length || 0} elementos
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const nextName = prompt("Nuevo nombre", view.name);
                        if (nextName && nextName.trim()) {
                          onRenameView?.(view.id, nextName.trim());
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-sky-600"
                      title="Renombrar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteView?.(view.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        {viewsLoading && (
          <div className="text-[11px] text-slate-500">Cargando vistas...</div>
        )}
        {!viewsLoading && views.length === 0 && (
          <div className="text-[11px] text-slate-500">
            No hay vistas disponibles.
          </div>
        )}
      </div>
    </div>
  );

  const renderPropsSection = () => {
    if (!selectedElement) {
      return (
        <div className="flex h-full items-center justify-center text-[12px] text-slate-500">
          Selecciona un elemento del canvas
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-3 py-3 text-[11px] space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Tipo
          </p>
          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
            {selectedElement.type || "elemento"}
          </p>
        </div>

        {(selectedElement.data?.settings?.equipment || selectedElement.settings?.equipment || selectedElement.equipment) && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Equipo
            </p>
            <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
              {selectedElement.data?.settings?.equipment ||
                selectedElement.settings?.equipment ||
                selectedElement.equipment}
            </p>
          </div>
        )}

        

        {hasLabel && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Label
            </p>
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
              value={currentLabel || ""}
              onChange={e => {
                const nextLabel = e.target.value;
                onChange?.({
                  label: nextLabel,
                  data: {
                    ...(selectedElement.data || {}),
                    label: nextLabel,
                    settings: {
                      ...(selectedElement.data?.settings || {}),
                      attributeLabel: nextLabel,
                    },
                  },
                });
              }}
            />
          </div>
        )}

        {selectedElement.data?.type === "nav-button" && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Vista destino
            </p>
            <select
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
              value={currentTargetView}
              onChange={e =>
                onChange?.({
                  targetViewId: e.target.value,
                  data: { targetViewId: e.target.value, settings: { targetViewId: e.target.value } },
                })
              }
            >
              <option value="">Selecciona una vista</option>
              {views.map(view => (
                <option key={view.id} value={view.id}>
                  {view.name || view.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {(currentType === "shape-rect" ||
          currentType === "shape-circle" ||
          currentType === "shape-triangle") && (
          <div className="rounded border border-slate-200 bg-white p-3 shadow-sm space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Estilo forma
            </p>

            <div>
              <label className="block text-[10px] text-slate-500">Relleno</label>
              <input
                type="color"
                className="mt-1 h-8 w-full rounded border border-slate-300 p-1"
                value={currentSettings.fill || "#e2e8f0"}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement.data || {}),
                      settings: {
                        ...currentSettings,
                        fill: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500">Borde</label>
              <input
                type="color"
                className="mt-1 h-8 w-full rounded border border-slate-300 p-1"
                value={currentSettings.stroke || "#94a3b8"}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement.data || {}),
                      settings: {
                        ...currentSettings,
                        stroke: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            {currentType === "shape-rect" && (
              <div>
                <label className="block text-[10px] text-slate-500">Radio</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                  value={
                    typeof currentSettings.radius === "number"
                      ? currentSettings.radius
                      : 8
                  }
                  onChange={(e) =>
                    onChange?.({
                      data: {
                        ...(selectedElement.data || {}),
                        settings: {
                          ...currentSettings,
                          radius: Number(e.target.value || 0),
                        },
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="p-3 rounded border border-slate-200 bg-white shadow-sm">
          <h3 className="text-[11px] font-semibold mb-2 text-slate-700">
            Variables PLCs
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {uniquePlcVariables.length === 0 ? (
              <p className="text-xs text-slate-500">Cargando variables...</p>
            ) : (
              uniquePlcVariables.map((variableName) => (
                <button
                  key={variableName}
                  onClick={() => {
                    const tagMatch = allTags.find(t => t.variable === variableName);
                    const nextSettings = {
                      ...(selectedElement.data?.settings || {}),
                      variable: variableName,
                      attributeKey: variableName,
                      attributeLabel: variableName,
                      equipment: tagMatch?.equipment,
                      site: tagMatch?.site,
                      area: tagMatch?.area,
                      line: tagMatch?.line,
                      cell: tagMatch?.cell,
                      unit: tagMatch?.unit,
                    };

                    onChange?.({
                      variable: variableName,
                      equipment: tagMatch?.equipment,
                      data: {
                        ...(selectedElement.data || {}),
                        variable: variableName,
                        equipment: tagMatch?.equipment,
                        attributeLabel: variableName,
                        settings: nextSettings,
                      },
                    });
                  }}
                  className={`w-full text-left p-2 rounded text-xs truncate transition-colors ${
                    selectedElement.variable === variableName ||
                    selectedElement.settings?.variable === variableName
                      ? "bg-sky-100 text-sky-800 font-medium"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  title={variableName}
                >
                  {variableName}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="flex w-80 flex-col border-l border-slate-200 bg-white shadow-lg">
      <div className="flex items-center border-b border-slate-200 px-3 py-2">
        <button
          className={`flex-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] px-2 py-1 rounded ${
            activeTab === "views"
              ? "bg-sky-100 text-sky-800 border border-sky-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("views")}
        >
          Vistas
        </button>
        <button
          className={`flex-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] px-2 py-1 rounded ${
            activeTab === "props"
              ? "bg-sky-100 text-sky-800 border border-sky-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("props")}
        >
          Propiedades
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === "views" ? renderViewsSection() : renderPropsSection()}
      </div>
    </aside>
  );
};

export default SidebarPropiedades;
