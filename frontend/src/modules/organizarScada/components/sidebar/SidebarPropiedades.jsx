// SidebarPropiedades.jsx
// Panel de propiedades: solo edición de dashboard y elementos (las vistas se gestionan en el sidebar principal).
import React, { useMemo } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";

const SidebarPropiedades = ({
  isOpen = true,
  selectedElement,
  views = [],
  onChange,
  exportName,
  onExportNameChange,
}) => {
  const { allTags } = useGatewayData();

  const uniquePlcVariables = useMemo(() => {
    const variables = allTags.map((tag) => tag.variable).filter(Boolean);
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

  const renderEmptyState = () => (
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
      <div className="flex h-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-[12px] text-slate-500">
        Selecciona un elemento del canvas para editar sus propiedades.
      </div>
    </div>
  );

  const renderProps = () => (
    <div className="flex-1 overflow-y-auto px-3 py-3 text-[11px] space-y-4">
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

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Tipo
        </p>
        <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
          {currentType || "elemento"}
        </p>
      </div>

      {(selectedElement?.data?.settings?.equipment ||
        selectedElement?.settings?.equipment ||
        selectedElement?.equipment) && (
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
            onChange={(e) => {
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

      {selectedElement?.data?.type === "nav-button" && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Vista destino
          </p>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
            value={currentTargetView}
            onChange={(e) =>
              onChange?.({
                targetViewId: e.target.value,
                data: {
                  ...(selectedElement.data || {}),
                  targetViewId: e.target.value,
                  settings: { ...(currentSettings || {}), targetViewId: e.target.value },
                },
              })
            }
          >
            <option value="">Selecciona una vista</option>
            {views.map((view) => (
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
            uniquePlcVariables.map((variableName) => {
              const tagMatch = allTags.find((t) => t.variable === variableName);
              const isSelectedVar =
                selectedElement?.variable === variableName ||
                selectedElement?.settings?.variable === variableName ||
                selectedElement?.data?.settings?.variable === variableName;
              return (
                <button
                  key={variableName}
                  onClick={() => {
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
                    isSelectedVar
                      ? "bg-sky-100 text-sky-800 font-medium"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  title={variableName}
                >
                  {variableName}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <aside className="flex w-80 flex-col border-l border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Propiedades
        </p>
      </div>
      {selectedElement ? renderProps() : renderEmptyState()}
    </aside>
  );
};

export default SidebarPropiedades;
