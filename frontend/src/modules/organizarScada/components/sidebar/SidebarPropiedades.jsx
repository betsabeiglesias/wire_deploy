// SidebarPropiedades.jsx
// Panel tipo Siemens TIA Portal, ubicado debajo del canvas.
import React, { useMemo } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";

const tabs = [
  "General",
  "Settings",
  "Range",
  "Linear scaling",
  "Values",
  "Comment",
  "Multiplexing",
];

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
  const currentTargetView =
    selectedElement?.targetViewId ||
    selectedElement?.data?.targetViewId ||
    selectedElement?.data?.settings?.targetViewId ||
    "";
  const currentType = selectedElement?.data?.type || selectedElement?.type;
  const currentSettings = selectedElement?.data?.settings || {};

  const selectedName = selectedElement?.data?.name || selectedElement?.name || currentLabel;

  const renderEmpty = () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-700">Propiedades</p>
        <span className="text-[11px] text-slate-500">Selecciona un elemento del canvas.</span>
      </div>
      <div className="grid grid-cols-[180px_1fr] gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="space-y-2">
          {tabs.slice(0, 5).map((t) => (
            <div
              key={t}
              className="rounded px-2 py-2 text-[12px] text-slate-500 bg-white border border-slate-200"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center text-slate-500 text-sm">
          Sin selección
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="p-4 bg-slate-100 border-t border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-sm font-semibold text-slate-800">
          {selectedName || "Elemento seleccionado"}
        </p>
        <span className="text-[11px] text-slate-500">Tipo: {currentType || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-4">
        {/* Tabs laterales */}
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              className="w-full text-left px-3 py-2 text-[12px] text-slate-700 hover:bg-sky-50"
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panel derecho */}
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800">General</h4>
              <label className="text-[11px] text-slate-600">Name</label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={selectedName || ""}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      name: e.target.value,
                      label: e.target.value,
                      settings: {
                        ...(selectedElement?.data?.settings || {}),
                        attributeLabel: e.target.value,
                      },
                    },
                  })
                }
              />

              <label className="text-[11px] text-slate-600">Display name</label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={currentLabel || ""}
                onChange={(e) =>
                  onChange?.({
                    label: e.target.value,
                    data: {
                      ...(selectedElement?.data || {}),
                      label: e.target.value,
                      settings: {
                        ...(selectedElement?.data?.settings || {}),
                        attributeLabel: e.target.value,
                      },
                    },
                  })
                }
              />

              <label className="text-[11px] text-slate-600">Connection</label>
              <input
                disabled
                className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[12px] text-slate-500"
                value={currentSettings.connection || "INTENANCE"}
                readOnly
              />

              <label className="text-[11px] text-slate-600">PLC tag</label>
              <select
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={currentTargetView}
                onChange={(e) =>
                  onChange?.({
                    targetViewId: e.target.value,
                    data: {
                      ...(selectedElement?.data || {}),
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

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800">Settings</h4>
              <label className="text-[11px] text-slate-600">Data type</label>
              <select
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={currentSettings.type || "Float"}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      settings: { ...(currentSettings || {}), type: e.target.value },
                    },
                  })
                }
              >
                {["Float", "UInt32", "Int", "Bool", "String"].map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>

              <label className="text-[11px] text-slate-600">Length</label>
              <input
                type="number"
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={currentSettings.length || 4}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      settings: { ...(currentSettings || {}), length: Number(e.target.value) || 0 },
                    },
                  })
                }
              />

              <label className="text-[11px] text-slate-600">Coding</label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={currentSettings.coding || "Binary"}
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      settings: { ...(currentSettings || {}), coding: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>

          {/* <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Variables PLC</h4>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {uniquePlcVariables.length === 0 && (
                <p className="text-xs text-slate-500 col-span-4">Cargando variables...</p>
              )}
              {uniquePlcVariables.map((variableName) => {
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
                        ...(selectedElement?.data?.settings || {}),
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
                          ...(selectedElement?.data || {}),
                          variable: variableName,
                          equipment: tagMatch?.equipment,
                          attributeLabel: variableName,
                          settings: nextSettings,
                        },
                      });
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors ${
                      isSelectedVar
                        ? "bg-sky-100 text-sky-800 font-semibold"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                    title={variableName}
                  >
                    {variableName}
                  </button>
                );
              })}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
