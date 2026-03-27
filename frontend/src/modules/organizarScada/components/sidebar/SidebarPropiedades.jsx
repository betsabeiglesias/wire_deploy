// src/modules/organizarScada/components/sidebar/SidebarPropiedades.jsx

import React, { useEffect, useState } from "react";
import { TagSelector } from "./TagSelector";
import WidgetPreview from "@/modules/organizarScada/components/widgets/WidgetPreview";

const tabs = ["General", "Dispositivo", "Estilo"];

const SidebarPropiedades = ({
  isOpen = true,
  selectedElement,
  views = [],
  onChange,
  exportName,
  onExportNameChange,
  layoutId = null,
}) => {

  const [activeTab, setActiveTab] = useState("General");
  const [varSearch, setVarSearch] = useState("");

  const currentLabel =
    selectedElement?.label ??
    selectedElement?.data?.label ??
    selectedElement?.data?.settings?.attributeLabel;

  const currentType     = selectedElement?.data?.type || selectedElement?.type;
  const currentSettings = selectedElement?.data?.settings || {};
  const selectedName    = selectedElement?.data?.name || selectedElement?.name || currentLabel;

  const isTempGauge        = currentType === "temp-gauge";
  const isScadaGauge       = currentType === "hmi-scada-gauge" || currentType === "hmiScadaGauge";
  const isProgressBar      = currentType === "hmi-progress-bar";
  const isTankLevel        = currentType === "hmi-tank-level";
  const isImageWidget      = currentType === "image-widget";
  const isEnergyBar        = currentType === "hmi-energy-bar" || currentType === "energy-bar";
  const isNavigationButton = currentType === "nav-button" || currentType === "btn-primary" || currentType === "btn-outline";

  const currentTargetView =
    selectedElement?.targetViewId ??
    selectedElement?.data?.targetViewId ??
    selectedElement?.data?.settings?.targetViewId ??
    "";

  // 🔹 UPDATE (SIN TOCAR)
  const updateSettings = (patch) =>{
    onChange?.({
      data: {
        ...(selectedElement?.data || {}),
        settings: {
          ...(currentSettings || {}),
          ...patch
        }
      }
    });
  };

  const updateGeometry = (patch) =>
    onChange?.({
      ...patch,
      data: {
        ...(selectedElement?.data || {}),
        width: patch?.width !== undefined ? patch.width : selectedElement?.data?.width,
        height: patch?.height !== undefined ? patch.height : selectedElement?.data?.height,
        settings: { ...(selectedElement?.data?.settings || {}) }
      }
    });

  // ─────────────────────────────────────────────
  // VARIABLES API (SIN TOCAR)
  // ─────────────────────────────────────────────

  const [projectTables, setProjectTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");

  useEffect(() => {
    if (!layoutId) { setProjectTables([]); return; }

    setLoadingTables(true);

    fetch(`/api/scada/layouts/${layoutId}/tables/`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setProjectTables(Array.isArray(data) ? data : []))
      .catch(() => setProjectTables([]))
      .finally(() => setLoadingTables(false));
  }, [layoutId]);

  useEffect(() => {
    setSelectedTableId(currentSettings.deviceTable || "");
  }, [selectedElement?.id]);

  const selectedTableObj = projectTables.find(t => String(t.id) === String(selectedTableId));
  const tableVariables   = selectedTableObj?.variables || [];

  if (!isOpen) return null;

  // ─────────────────────────────────────────────
  // GENERAL
  // ─────────────────────────────────────────────

  const renderGeneral = () => (
    <div className="space-y-3">

      <div>
        <label className="block text-[11px] text-slate-600">Nombre</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
          value={selectedName || ""}
          onChange={(e) =>
            onChange?.({
              data: {
                ...(selectedElement?.data || {}),
                name: e.target.value,
                label: e.target.value,
                settings: {
                  ...(selectedElement?.data?.settings || {}),
                  label: e.target.value,
                  attributeLabel: e.target.value
                }
              }
            })
          }
        />
      </div>

    </div>
  );

  // ─────────────────────────────────────────────
  // DISPOSITIVO (SIN CAMBIOS FUNCIONALES)
  // ─────────────────────────────────────────────

  const renderDispositivo = () => {

    const linkedVarId = currentSettings.variableId || "";
    const linkedVar   = tableVariables.find(v => v.variable_id === linkedVarId);

    const filteredVariables = tableVariables.filter(v => {
      if (!varSearch.trim()) return true;
      const q = varSearch.toLowerCase();
      return (
        v.name?.toLowerCase().includes(q) ||
        v.equipment?.toLowerCase().includes(q) ||
        v.variable?.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-4">

        <input
          className="w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
          placeholder="Buscar variable..."
          value={varSearch}
          onChange={(e) => setVarSearch(e.target.value)}
        />

        <select
          className="w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
          value={selectedTableId}
          onChange={(e) => {
            setSelectedTableId(e.target.value);
            updateSettings({ deviceTable: e.target.value, variableId: "" });
          }}
        >
          <option value="">Selecciona tabla</option>
          {projectTables.map(t => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>

        {selectedTableId && (
          <select
            className="w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
            value={linkedVarId}
            onChange={(e) => {
              const varId = e.target.value;
              const meta  = tableVariables.find(v => v.variable_id === varId);

              updateSettings({
                variableId: varId,
                variable: meta?.variable || meta?.name || "",
                equipment: meta?.equipment || "",
                unit: meta?.unit || "",
                datatype: meta?.datatype || "",
                deviceTable: selectedTableId,
              });
            }}
          >
            <option value="">Selecciona variable</option>
            {filteredVariables.map(v => (
              <option key={v.variable_id} value={v.variable_id}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        {linkedVar && (
          <div className="text-xs text-slate-500">
            {linkedVar.name} ({linkedVar.unit})
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // ESTILO (SIN TOCAR)
  // ─────────────────────────────────────────────

  const renderEstilo = () => (
    <div className="text-xs text-slate-500">
      Configuración de estilo
    </div>
  );

  // ─────────────────────────────────────────────
  // UI FINAL (AQUÍ ESTÁ EL CAMBIO IMPORTANTE)
  // ─────────────────────────────────────────────

  const renderContent = () => (
    <div className="p-4 bg-white border rounded-lg shadow-sm space-y-4">

      {/* 🔹 HEADER CON PREVIEW */}
      <div className="flex items-center gap-3 p-3 border rounded bg-slate-50">

        <div className="w-20 h-20 flex items-center justify-center rounded bg-white border">
          {selectedElement?.data && (
            <WidgetPreview
              data={selectedElement.data}
              unit={currentSettings?.unit}
            />
          )}
        </div>

        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-700">
            {selectedName || "Sin nombre"}
          </span>
          <span className="text-slate-400">
            {currentType}
          </span>
        </div>
      </div>

      {/* 🔹 TABS */}
      <nav className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs ${
                active ? "text-sky-600 border-b-2 border-sky-500" : "text-slate-500"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* 🔹 CONTENT */}
      <div className="pt-2 min-h-[200px]">
        {activeTab==="General" && renderGeneral()}
        {activeTab==="Dispositivo" && renderDispositivo()}
        {activeTab==="Estilo" && renderEstilo()}
      </div>
    </div>
  );

  const renderEmpty = () => (
    <div className="p-4 text-sm text-slate-500">
      Selecciona un elemento
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;