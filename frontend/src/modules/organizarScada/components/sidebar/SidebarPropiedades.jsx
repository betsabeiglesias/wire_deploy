// src/modules/organizarScada/components/sidebar/SidebarPropiedades.jsx

import React, { useEffect, useState, useRef } from "react";
import { TagSelector } from "./TagSelector";
import WidgetPreview from "@/modules/organizarScada/components/widgets/WidgetPreview";
import { widgetStyleSchema } from "../widgets/WidgetStyleSchema";

const tabs = ["General", "Dispositivo", "Estilo"];

// ─── átomos de UI ─────────────────────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <p className="text-[10px] font-medium tracking-[0.06em] uppercase text-slate-400 mb-1.5">
    {children}
  </p>
);

const FieldInput = ({ className = "", ...props }) => (
  <input
    className={`w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2
      text-[12px] text-slate-800 outline-none appearance-none placeholder:text-slate-300
      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition
      ${className}`}
    {...props}
  />
);

const FieldSelect = ({ className = "", children, ...props }) => (
  <select
    className={`w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2
      text-[12px] text-slate-800 outline-none appearance-none
      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition
      ${className}`}
    {...props}
  >
    {children}
  </select>
);

const SectionCard = ({ title, children }) => (
  <div className="border border-slate-200 rounded-[10px] overflow-hidden">
    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
      <p className="text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
        {title}
      </p>
    </div>
    <div className="p-4 bg-white flex flex-col gap-3">
      {children}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-[34px] h-[18px] rounded-full relative transition-colors flex-shrink-0 border-none outline-none
      ${checked ? "bg-blue-500" : "bg-slate-200"}`}
  >
    <span className={`absolute top-[3px] w-3 h-3 bg-white rounded-full shadow-sm transition-transform
      ${checked ? "translate-x-[19px]" : "translate-x-[3px]"}`}
    />
  </button>
);

const SegmentedControl = ({ options, value, onChange }) => (
  <div className="flex gap-1.5">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-4 py-1.5 rounded-md text-[11px] font-medium border transition
          ${value === opt.value
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
          }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ColorField = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    {label && <FieldLabel>{label}</FieldLabel>}
    <label
      className="w-full h-8 rounded-md border border-slate-200 cursor-pointer
        overflow-hidden hover:border-blue-300 transition relative block"
      style={{ background: value || "#3b82f6" }}
    >
      <input
        type="color"
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        value={value || "#3b82f6"}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
    <input
      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5
        text-[11px] text-slate-700 font-mono outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
      value={value || ""}
      maxLength={7}
      onChange={(e) => {
        if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value);
      }}
    />
  </div>
);

const LinkedVarBadge = ({ variable }) => (
  <div className="flex items-center justify-between bg-slate-50 border border-slate-200
    rounded-md px-3 py-2.5">
    <div>
      <p className="text-[12px] font-medium text-slate-700">{variable.name}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">
        {variable.equipment} · {variable.datatype}
      </p>
    </div>
    <span className="text-[10px] font-mono text-blue-600 bg-blue-50
      border border-blue-100 rounded px-2 py-0.5">
      {variable.unit}
    </span>
  </div>
);

// ─── ScaledPreview: escala el widget para que llene el contenedor ─────────────
// WidgetPreview renderiza a su tamaño natural. Lo envolvemos en un contenedor
// con overflow:hidden y aplicamos transform:scale calculado dinámicamente.
const ScaledPreview = ({ data, unit }) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const calc = () => {
      const ow = outer.clientWidth  || 1;
      const oh = outer.clientHeight || 1;
      const iw = inner.scrollWidth  || 1;
      const ih = inner.scrollHeight || 1;
      // padding interior: dejamos un margen del 10%
      const sx = (ow * 0.90) / iw;
      const sy = (oh * 0.90) / ih;
      setScale(Math.min(sx, sy, 3)); // cap en 3× para no distorsionar
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [data, unit]);

  return (
    <div
      ref={outerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div
        ref={innerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <WidgetPreview data={data} unit={unit} />
      </div>
    </div>
  );
};

// ─── componente principal ─────────────────────────────────────────────────────

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

  // ── draft completo del elemento (lógica original) ─────────────────────────
  const [draftElement,    setDraftElement]    = useState(selectedElement);
  const [originalElement, setOriginalElement] = useState(selectedElement);

  useEffect(() => {
    setDraftElement(selectedElement);
    setOriginalElement(JSON.parse(JSON.stringify(selectedElement)));
  }, [selectedElement?.id]);

  const isDirty = React.useMemo(() => {
    return JSON.stringify(draftElement) !== JSON.stringify(originalElement);
  }, [draftElement, originalElement]);

  const currentLabel =
    draftElement?.label ??
    draftElement?.data?.label ??
    draftElement?.data?.settings?.attributeLabel;

  const currentType     = draftElement?.data?.type || draftElement?.type;
  const currentSettings = draftElement?.data?.settings || {};
  const selectedName    = draftElement?.data?.name || draftElement?.name || currentLabel;

  const isTempGauge        = currentType === "temp-gauge";
  const isScadaGauge       = currentType === "hmi-scada-gauge" || currentType === "hmiScadaGauge";
  const isProgressBar      = currentType === "hmi-progress-bar";
  const isTankLevel        = currentType === "hmi-tank-level";
  const isImageWidget      = currentType === "image-widget";
  const isEnergyBar        = currentType === "hmi-energy-bar" || currentType === "energy-bar";
  const isNavigationButton = currentType === "nav-button" || currentType === "btn-primary" || currentType === "btn-outline";

  const currentTargetView =
    draftElement?.targetViewId ??
    draftElement?.data?.targetViewId ??
    draftElement?.data?.settings?.targetViewId ??
    "";

  // ── helpers de mutación originales (sin tocar) ────────────────────────────
  const updateDraft = (patch) => {
    setDraftElement(prev => ({
      ...prev,
      ...patch,
      data: {
        ...(prev?.data || {}),
        ...(patch?.data || {}),
      },
    }));
  };

  const updateSettings = (patch) => {
    setDraftElement(prev => ({
      ...prev,
      data: {
        ...(prev?.data || {}),
        settings: {
          ...(prev?.data?.settings || {}),
          ...patch,
        },
      },
    }));
  };

  const updateGeometry = (patch) =>
    setDraftElement(prev => ({
      ...prev,
      ...patch,
      data: {
        ...(prev?.data || {}),
        width:  patch?.width  ?? prev?.data?.width,
        height: patch?.height ?? prev?.data?.height,
        settings: { ...(prev?.data?.settings || {}) },
      },
    }));

  // ── variables API original (sin tocar) ────────────────────────────────────
  const [projectTables,   setProjectTables]   = useState([]);
  const [loadingTables,   setLoadingTables]   = useState(false);
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
  }, [draftElement?.id]);

  const selectedTableObj = projectTables.find(t => String(t.id) === String(selectedTableId));
  const tableVariables   = selectedTableObj?.variables || [];

  if (!isOpen) return null;

  // ─── TAB: General ─────────────────────────────────────────────────────────
  const renderGeneral = () => (
    <div className="flex flex-col gap-3">
      <SectionCard title="Identificación">
        <div>
          <FieldLabel>Nombre</FieldLabel>
          <FieldInput
            value={selectedName || ""}
            placeholder="Nombre del widget"
            onChange={(e) =>
              updateDraft({
                data: {
                  ...(draftElement?.data || {}),
                  name:  e.target.value,
                  label: e.target.value,
                  settings: {
                    ...(draftElement?.data?.settings || {}),
                    label:          e.target.value,
                    attributeLabel: e.target.value,
                  },
                },
              })
            }
          />
        </div>
      </SectionCard>
    </div>
  );

  // ─── TAB: Dispositivo (lógica original) ───────────────────────────────────
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
      <div className="flex flex-col gap-3">
        <SectionCard title="Origen de datos">

          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
              width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#475569" strokeWidth="1.5"/>
              <line x1="10" y1="10" x2="14" y2="14" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <FieldInput
              className="pl-8"
              placeholder="Buscar variable..."
              value={varSearch}
              onChange={(e) => setVarSearch(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Tabla</FieldLabel>
            <FieldSelect
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                updateSettings({ deviceTable: e.target.value, variableId: "" });
              }}
            >
              <option value="">Selecciona tabla</option>
              {projectTables.map(t => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </FieldSelect>
          </div>

          {selectedTableId && (
            <div>
              <FieldLabel>Variable</FieldLabel>
              <FieldSelect
                value={linkedVarId}
                onChange={(e) => {
                  const varId = e.target.value;
                  const meta  = tableVariables.find(v => v.variable_id === varId);
                  updateSettings({
                    variableId:  varId,
                    variable:    meta?.variable || meta?.name || "",
                    equipment:   meta?.equipment || "",
                    unit:        meta?.unit || "",
                    datatype:    meta?.datatype || "",
                    deviceTable: selectedTableId,
                  });
                }}
              >
                <option value="">Selecciona variable</option>
                {filteredVariables.map(v => (
                  <option key={v.variable_id} value={v.variable_id}>{v.name}</option>
                ))}
              </FieldSelect>
            </div>
          )}
        </SectionCard>

        {linkedVar && (
          <SectionCard title="Variable enlazada">
            <LinkedVarBadge variable={linkedVar} />
          </SectionCard>
        )}
      </div>
    );
  };

  // ─── TAB: Estilo (widgetStyleSchema original) ──────────────────────────────
  const renderEstilo = () => {
    const schema  = widgetStyleSchema[currentType] || widgetStyleSchema.default;
    const palette = currentSettings.style?.palette || {};
    const mode    = currentSettings.style?.mode || "solid";

    return (
      <div className="flex flex-col gap-3">

        <SectionCard title="Modo de color">
          <SegmentedControl
            options={[
              { value: "solid", label: "Sólido" },
              { value: "zones", label: "Zonas"  },
            ]}
            value={mode}
            onChange={(val) =>
              updateSettings({
                style: { ...(currentSettings.style || {}), mode: val },
              })
            }
          />
        </SectionCard>

        {schema.map((group) => (
          <SectionCard key={group.group} title={group.group}>
            <div className="grid grid-cols-2 gap-3">
              {group.fields.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  value={palette[field.key] || "#3b82f6"}
                  onChange={(val) =>
                    updateSettings({
                      style: {
                        ...(currentSettings.style || {}),
                        palette: { ...(palette || {}), [field.key]: val },
                      },
                    })
                  }
                />
              ))}
            </div>
          </SectionCard>
        ))}

      </div>
    );
  };

  // ─── SHELL ────────────────────────────────────────────────────────────────
  const renderContent = () => (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
            {selectedName || "Sin nombre"}
          </p>
          <p className="text-[11px] text-slate-400 leading-tight">{currentType}</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      </div>

      {/* TABS */}
      <nav className="flex px-5 bg-white border-b border-slate-200 gap-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent" }}
            className={`py-2.5 px-3 text-[11px] font-medium border-none outline-none
              cursor-pointer transition bg-transparent
              ${activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* CONTENT con scroll */}
      <div className="p-4 overflow-y-auto max-h-[40vh]">
        {activeTab === "General"     && renderGeneral()}
        {activeTab === "Dispositivo" && renderDispositivo()}
        {activeTab === "Estilo"      && renderEstilo()}
      </div>

      {/* PREVIEW GRANDE — ScaledPreview escala el widget para llenar el área */}
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-[9px] font-medium tracking-[0.08em] uppercase text-slate-400 mb-3">
          Vista previa
        </p>
        {draftElement?.data ? (
          <div className="w-full h-[180px] bg-white border border-slate-200 rounded-xl overflow-hidden">
            <ScaledPreview
              data={draftElement.data}
              unit={currentSettings?.unit}
            />
          </div>
        ) : null}
      </div>

      {/* FOOTER */}
      <div className="px-5 pb-5 pt-3 bg-white border-t border-slate-100 flex flex-col gap-2.5">
        <p className={`text-[10px] font-mono text-center min-h-[14px] transition-colors
          ${isDirty ? "text-amber-500" : "text-slate-300"}`}>
          {isDirty ? "Cambios sin guardar" : "Sin cambios pendientes"}
        </p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            disabled={!isDirty}
            onClick={() => {
              onChange?.(draftElement);
              setOriginalElement(JSON.parse(JSON.stringify(draftElement)));
            }}
            className={`py-2.5 rounded-lg text-[11px] font-semibold tracking-wide transition border
              ${isDirty
                ? "bg-blue-600 border-blue-700 text-white cursor-pointer hover:bg-blue-700"
                : "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed"
              }`}
          >
            ▶ Aplicar cambios
          </button>
          <button
            disabled={!isDirty}
            onClick={() => setDraftElement(JSON.parse(JSON.stringify(originalElement)))}
            className={`px-4 py-2.5 rounded-lg text-[11px] font-medium transition border whitespace-nowrap
              ${isDirty
                ? "bg-white border-slate-200 text-slate-500 cursor-pointer hover:border-slate-300 hover:text-slate-700"
                : "bg-white border-slate-100 text-slate-300 cursor-not-allowed"
              }`}
          >
            Descartar
          </button>
        </div>
      </div>

    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-200">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p className="text-[12px] text-slate-400">Selecciona un elemento del canvas</p>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
