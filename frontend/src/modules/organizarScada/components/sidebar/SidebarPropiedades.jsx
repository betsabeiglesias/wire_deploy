// SidebarPropiedades.jsx
// Panel de propiedades con tabs horizontales ligeros (estilo barra clara).
import React, { useMemo, useState } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";

const tabs = [
  "General",
  "Dipositivo",
  "Estilo",
  // "Cambios",
  // "Compatibilidad",
  // "Tipografía",
  // "Animaciones",
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
  const [activeTab, setActiveTab] = useState("General");

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
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-700">Propiedades</p>
        <span className="text-[11px] text-slate-500">Selecciona un elemento del canvas.</span>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-800">
          {selectedName || "Elemento seleccionado"}
        </p>
        <span className="text-[11px] text-slate-500">Tipo: {currentType || "N/A"}</span>
      </div>

      {/* Tabs horizontales estilo barra continua */}
      <nav className="flex items-center gap-1 overflow-x-auto px-1 py-1 bg-white border-b border-slate-200 no-scrollbar" style={{ margin: 0 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "min-w-[72px] px-4 py-2 text-[12px] font-medium transition-colors border border-transparent rounded-t-sm",
                isActive
                  ? "bg-slate-100 text-slate-900 border-slate-300 border-b-2 border-b-sky-500"
                  : "bg-white text-slate-600 hover:text-slate-900",
              ].join(" ")}
              type="button"
            >
              {tab}
            </button>
          );
        })}
        <button
          type="button"
          className="ml-auto px-3 py-2 text-slate-500 hover:text-slate-800"
          title="Más opciones (futuro)"
        >
          ...
        </button>
      </nav>

      <div className="bg-white border border-slate-200 border-t-0 rounded-sm p-4 min-h-[240px]">
        {activeTab === "General" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] text-slate-600">Name (SVG)</label>
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

              <label className="text-[11px] text-slate-600">Min value</label>
              <input
                type="number"
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={
                  typeof currentSettings.min === "number"
                    ? currentSettings.min
                    : ""
                }
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      settings: {
                        ...(currentSettings || {}),
                        min: e.target.value === "" ? undefined : Number(e.target.value),
                      },
                    },
                  })
                }
              />

              <label className="text-[11px] text-slate-600">Max value</label>
              <input
                type="number"
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={
                  typeof currentSettings.max === "number"
                    ? currentSettings.max
                    : ""
                }
                onChange={(e) =>
                  onChange?.({
                    data: {
                      ...(selectedElement?.data || {}),
                      settings: {
                        ...(currentSettings || {}),
                        max: e.target.value === "" ? undefined : Number(e.target.value),
                      },
                    },
                  })
                }
              />

              <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  checked={!!currentSettings.showValue}
                  onChange={(e) =>
                    onChange?.({
                      data: {
                        ...(selectedElement?.data || {}),
                        settings: {
                          ...(currentSettings || {}),
                          showValue: e.target.checked,
                        },
                      },
                    })
                  }
                />
                Mostrar valor del SVG
              </label>

              <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  checked={currentSettings.visible !== false}
                  onChange={(e) =>
                    onChange?.({
                      data: {
                        ...(selectedElement?.data || {}),
                        settings: {
                          ...(currentSettings || {}),
                          visible: e.target.checked,
                        },
                      },
                    })
                  }
                />
                Visible
              </label>

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
                className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-[12px] text-slate-500"
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
        )}

        {activeTab !== "General" && (
          <div className="text-[12px] text-slate-500">
            Contenido pendiente para “{activeTab}”. (Próximamente)
          </div>
        )}
      </div>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
