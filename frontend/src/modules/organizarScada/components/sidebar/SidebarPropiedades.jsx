// src/modules/organizarScada/components/sidebar/SidebarPropiedades.jsx
// Panel de propiedades con tabs horizontales ligeros.
// Tab "Dispositivo" usa ProjectVariables de la API (tablas del proyecto).
import React, { useEffect, useState } from "react";
import { TagSelector } from "./TagSelector";

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
  console.log("🎯 SidebarPropiedades selectedElement:", selectedElement?.id, selectedElement?.data?.type);

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

  const updateSettings = (patch) =>{
    console.log("💾 updateSettings patch:", patch);
    console.log("💾 selectedElement?.id:", selectedElement?.id);
    onChange?.({ data: { ...(selectedElement?.data || {}), settings: { ...(currentSettings || {}), ...patch } } });
  };
  const updateGeometry = (patch) =>
    onChange?.({ ...patch, data: { ...(selectedElement?.data || {}), width: patch?.width !== undefined ? patch.width : selectedElement?.data?.width, height: patch?.height !== undefined ? patch.height : selectedElement?.data?.height, settings: { ...(selectedElement?.data?.settings || {}) } } });

  const rgbaToHex = (value, fallback) => {
    if (!value) return fallback;
    const t = String(value).trim();
    if (t.startsWith("#")) { if (t.length === 7) return t; if (t.length === 4) return "#" + t[1]+t[1]+t[2]+t[2]+t[3]+t[3]; return fallback; }
    const m = t.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return fallback;
    const [r,g,b] = [Number(m[1]),Number(m[2]),Number(m[3])];
    if ([r,g,b].some(Number.isNaN)) return fallback;
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  };

  // ── ProjectVariables desde API ──────────────────────────────────────────────
  const [projectTables,   setProjectTables]   = useState([]);
  const [loadingTables,   setLoadingTables]   = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");

  useEffect(() => {
    if (!layoutId) { setProjectTables([]); return; }
    setLoadingTables(true);
    fetch(`/api/scada/layouts/${layoutId}/tables/`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
          console.log("📦 tables sample:", JSON.stringify(data[0], null, 2));
          setProjectTables(Array.isArray(data) ? data : []);
        })
      .catch(() => setProjectTables([]))
      .finally(() => setLoadingTables(false));
  }, [layoutId]);

  useEffect(() => {
    setSelectedTableId(currentSettings.deviceTable || "");
  }, [selectedElement?.id]);

  const selectedTableObj = projectTables.find(t => String(t.id) === String(selectedTableId));
  const tableVariables   = selectedTableObj?.variables || [];

  if (!isOpen) return null;

  // ── GENERAL ─────────────────────────────────────────────────────────────────
  const renderGeneral = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] text-slate-600">Nombre</label>
        <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
          value={selectedName || ""}
          onChange={(e) => onChange?.({ data: { ...(selectedElement?.data || {}), name: e.target.value, label: e.target.value, settings: { ...(selectedElement?.data?.settings || {}), label: e.target.value, attributeLabel: e.target.value } } })} />
      </div>
      {isImageWidget && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Posición y tamaño</p>
          <div className="grid grid-cols-2 gap-2">
            {[["X","x",null],["Y","y",null],["Width","width",20],["Height","height",20]].map(([lbl,key,min]) => (
              <div key={key}>
                <label className="block text-[10px] text-slate-500">{lbl}</label>
                <input type="number" {...(min !== null ? {min} : {})} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                  value={Number(key==="x"||key==="y" ? selectedElement?.[key]??0 : selectedElement?.data?.[key]??(key==="width"?220:180))}
                  onChange={(e) => { const v = min!==null ? Math.max(min,Number(e.target.value)||min) : Number(e.target.value)||0; updateGeometry({[key]:v}); }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {isNavigationButton && (
        <div>
          <label className="block text-[11px] text-slate-600">Vista destino</label>
          <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            value={currentTargetView}
            onChange={(e) => { const v=e.target.value; onChange?.({targetViewId:v,data:{...(selectedElement?.data||{}),targetViewId:v,settings:{...(selectedElement?.data?.settings||{}),targetViewId:v}}}); }}>
            <option value="">Selecciona una vista</option>
            {views.map(v => <option key={v.id} value={v.id}>{v.name||v.id}</option>)}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">En producción este botón navegará a la vista seleccionada.</p>
        </div>
      )}
      {!isImageWidget && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[["Min","min"],["Max","max"]].map(([lbl,key]) => (
              <div key={key}>
                <label className="block text-[11px] text-slate-600">{lbl}</label>
                <input type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                  value={typeof currentSettings[key]==="number" ? currentSettings[key] : ""}
                  onChange={(e) => updateSettings({[key]: e.target.value===""?undefined:Number(e.target.value)})} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {[["Ver nombre","showLabel"],["Mostrar valor del SVG","showValue"]].map(([lbl,key]) => (
              <label key={key} className="inline-flex items-center gap-2 text-[12px] text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  checked={currentSettings[key]!==false} onChange={(e) => updateSettings({[key]:e.target.checked})} />
                {lbl}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ── DISPOSITIVO ──────────────────────────────────────────────────────────────
  const renderDispositivo = () => {
    const linkedVarId = currentSettings.variableId || "";
    const linkedVar   = tableVariables.find(v => v.variable_id === linkedVarId);

    // Filtrar variables según búsqueda
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

        {/* Buscador libre */}
        <div>
          <label className="block text-[11px] text-slate-600 mb-1">Buscar variable</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            placeholder="Escribe para filtrar..."
            value={varSearch}
            onChange={(e) => setVarSearch(e.target.value)}
          />
        </div>

        {/* Selector de tabla */}
        <div>
          <label className="block text-[11px] text-slate-600 mb-1">Tabla</label>
          {!layoutId ? (
            <p className="text-[11px] text-amber-600">⚠ Guarda el proyecto primero.</p>
          ) : loadingTables ? (
            <p className="text-[11px] text-slate-400">Cargando tablas…</p>
          ) : projectTables.length === 0 ? (
            <p className="text-[11px] text-amber-600">⚠ Sin tablas. Ve a "Dispositivos" para crearlas.</p>
          ) : (
            <select
              className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                setVarSearch("");
                updateSettings({ deviceTable: e.target.value, variableId: "" });
              }}>
              <option value="">— selecciona tabla —</option>
              {projectTables.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
            </select>
          )}
        </div>

        {/* Selector de variable filtrado */}
        {selectedTableId && (
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">Variable</label>
            {filteredVariables.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                {varSearch ? "Sin coincidencias." : "Sin variables en esta tabla."}
              </p>
            ) : (
              <select
                className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
                value={linkedVarId}
                onChange={(e) => {
                  const varId = e.target.value;
                  const meta  = tableVariables.find(v => v.variable_id === varId);
                  updateSettings({
                    variableId:   varId,
                    variable:     meta?.variable  || meta?.name || "",
                    equipment:    meta?.equipment || "",
                    unit:         meta?.unit      || "",
                    datatype:     meta?.datatype  || "",
                    deviceTable:  selectedTableId,
                  });
                }}>
                <option value="">— selecciona variable —</option>
                {filteredVariables.map(v => (
                  <option key={v.variable_id} value={v.variable_id}>
                    {v.name}{v.source === "connection" ? ` · ${v.equipment}` : " (local)"}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Info del binding actual */}
        {linkedVar && (
          <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2 space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Vinculado</p>
            <p className="text-[11px] font-semibold text-slate-800">{linkedVar.name}</p>
            {linkedVar.source === "connection" ? (
              <p className="text-[10px] text-slate-600">{linkedVar.equipment} › {linkedVar.variable}</p>
            ) : (
              <p className="text-[10px] text-slate-600">
                Local · {linkedVar.datatype}
                {linkedVar.initial_value != null ? ` = ${linkedVar.initial_value}` : ""}
              </p>
            )}
            {linkedVar.unit && <p className="text-[10px] text-slate-400">Unidad: {linkedVar.unit}</p>}
          </div>
        )}
      </div>
    );
  };

  // ── ESTILO ───────────────────────────────────────────────────────────────────
  const renderEstilo = () => (
    <div className="space-y-3">
      {!isTempGauge&&!isScadaGauge&&!isProgressBar&&!isTankLevel&&!isImageWidget&&!isEnergyBar&&(
        <div className="text-[12px] text-slate-500">Este widget no tiene controles de estilo personalizados.</div>
      )}
      {isImageWidget&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Image Widget</p><div><label className="block text-[11px] text-slate-600">Opacidad ({Number(currentSettings.opacity??100)}%)</label><input type="range" min={0} max={100} step={1} className="mt-2 w-full" value={Number(currentSettings.opacity??100)} onChange={(e)=>updateSettings({opacity:Number(e.target.value)||0})}/></div><label className="inline-flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" checked={currentSettings.lockAspectRatio!==false} onChange={(e)=>updateSettings({lockAspectRatio:e.target.checked})}/>Mantener relación de aspecto</label></div>)}
      {isScadaGauge&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">HMI Scada Gauge</p><div className="grid grid-cols-2 gap-3">{[["Color principal","themeColor","#94a3b8"],["Color valor","valueColor","#ffffff"],["Color unidad","unitColor","#64748b"]].map(([lbl,key,def])=>(<div key={key}><label className="block text-[11px] text-slate-600 mb-1">{lbl}</label><input type="color" className="h-10 w-full rounded border border-slate-300 bg-white" value={currentSettings[key]||def} onChange={(e)=>updateSettings({[key]:e.target.value})}/></div>))}</div><div className="grid grid-cols-2 gap-2">{[["Valor X","valueOffsetX"],["Valor Y","valueOffsetY"],["Unidad X","unitOffsetX"],["Unidad Y","unitOffsetY"]].map(([lbl,key])=>(<div key={key}><label className="block text-[10px] text-slate-500">{lbl}</label><input type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]" value={currentSettings[key]??0} onChange={(e)=>updateSettings({[key]:Number(e.target.value)||0})}/></div>))}</div></div>)}
      {isTempGauge&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">TempGauge</p><div className="grid grid-cols-2 gap-2">{[["Label X","labelOffsetX"],["Label Y","labelOffsetY"],["Valor X","valueOffsetX"],["Valor Y","valueOffsetY"]].map(([lbl,key])=>(<div key={key}><label className="block text-[10px] text-slate-500">{lbl}</label><input type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]" value={currentSettings[key]??0} onChange={(e)=>updateSettings({[key]:Number(e.target.value)||0})}/></div>))}</div><label className="inline-flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" checked={currentSettings.showMinMax!==false} onChange={(e)=>updateSettings({showMinMax:e.target.checked})}/>Mostrar min/max</label><div className="grid grid-cols-2 gap-2">{[["Min/Max size","minMaxFontSize","number",11],["Min/Max color","minMaxColor","color","#94a3b8"],["Label color","labelColor","color","#f87171"],["Value color","valueColor","color","#f87171"],["Needle color","needleColor","color","#ffffff"],["Tick color","tickColor","color","#fb923c"]].map(([lbl,key,type,def])=>(<div key={key}><label className="block text-[10px] text-slate-500">{lbl}</label><input type={type} className={`mt-1 w-full rounded border border-slate-300 ${type==="color"?"h-9":"px-2 py-1 text-[11px]"}`} value={type==="color"?rgbaToHex(currentSettings[key],def):(currentSettings[key]??def)} onChange={(e)=>updateSettings({[key]:type==="number"?Number(e.target.value)||def:e.target.value})}/></div>))}</div></div>)}
      {isProgressBar&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">HMI Progress Bar</p><div className="grid grid-cols-2 gap-3">{[["Color pista","trackFill","#1e2a3e"],["Borde pista","trackStroke","#2c6993"],["Gradiente inicio","gradientFrom","#3498db"],["Gradiente fin","gradientTo","#2980b9"],["Hatch stroke","hatchStroke","#2c6993"],["Color valor","percentColor","#ffffff"]].map(([lbl,key,def])=>(<div key={key}><label className="block text-[11px] text-slate-600 mb-1">{lbl}</label><input type="color" className="h-10 w-full rounded border border-slate-300 bg-white" value={currentSettings[key]||def} onChange={(e)=>updateSettings({[key]:e.target.value})}/></div>))}</div><div className="grid grid-cols-2 gap-2">{[["Valor X","valueOffsetX"],["Valor Y","valueOffsetY"],["Label X","labelOffsetX"],["Label Y","labelOffsetY"]].map(([lbl,key])=>(<div key={key}><label className="block text-[10px] text-slate-500">{lbl}</label><input type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]" value={currentSettings[key]??0} onChange={(e)=>updateSettings({[key]:Number(e.target.value)||0})}/></div>))}</div><div className="flex flex-col gap-1">{[["Mostrar label","showLabel"],["Mostrar valor","showValue"]].map(([lbl,key])=>(<label key={key} className="inline-flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" checked={key==="showLabel"?currentSettings[key]===true:currentSettings[key]!==false} onChange={(e)=>updateSettings({[key]:e.target.checked})}/>{lbl}</label>))}</div></div>)}
      {isEnergyBar&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Energy Bar Chart</p><div className="grid grid-cols-2 gap-3">{[["Fondo","bgColor","#1e272e"],["Grid","gridColor","#2f3640"],["Eje","axisColor","#57606f"],["Título","titleColor","#ecf0f1"],["Valor","valueColor","#00d2d3"],["Labels eje","labelColor","#95a5a6"],["Barra from","barGradientFrom","#00d2d3"],["Barra to","barGradientTo","#0984e3"],["Barra alerta","alertBarColor","#ff7675"],["Color límite","limitColor","#d63031"]].map(([lbl,key,def])=>(<div key={key}><label className="block text-[11px] text-slate-600 mb-1">{lbl}</label><input type="color" className="h-10 w-full rounded border border-slate-300 bg-white" value={currentSettings[key]||def} onChange={(e)=>updateSettings({[key]:e.target.value})}/></div>))}</div><div className="flex flex-wrap gap-3">{[["Mostrar título","showTitle"],["Mostrar valor","showValue"],["Mostrar grid","showGrid"],["Mostrar límite","showLimit"]].map(([lbl,key])=>(<label key={key} className="inline-flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" checked={currentSettings[key]!==false} onChange={(e)=>updateSettings({[key]:e.target.checked})}/>{lbl}</label>))}</div></div>)}
      {isTankLevel&&(<div className="rounded border border-slate-200 bg-white p-3 space-y-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">HMI Tank Level</p><div className="grid grid-cols-2 gap-3">{[["Tank dark","tankDark","#1a1f35"],["Tank top","tankTop","#252b45"],["Fluid base","fluidBase","#8e44ad"],["Gradient from","gradientFrom","#9b59b6"],["Gradient to","gradientTo","#8e44ad"],["Top from","topFrom","#d49cf2"],["Top to","topTo","#9b59b6"],["Color valor","percentColor","#ffffff"],["Color label","labelColor","#e2e8f0"]].map(([lbl,key,def])=>(<div key={key}><label className="block text-[11px] text-slate-600 mb-1">{lbl}</label><input type="color" className="h-10 w-full rounded border border-slate-300 bg-white" value={currentSettings[key]||def} onChange={(e)=>updateSettings({[key]:e.target.value})}/></div>))}<div className="col-span-2"><label className="block text-[11px] text-slate-600 mb-1">Label</label><input type="text" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]" value={currentSettings.label||""} onChange={(e)=>updateSettings({label:e.target.value})}/></div><div className="col-span-2"><label className="block text-[11px] text-slate-600 mb-1">Fuente</label><input type="text" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]" value={currentSettings.fontFamily||"Arial, sans-serif"} onChange={(e)=>updateSettings({fontFamily:e.target.value})}/></div></div><div className="grid grid-cols-2 gap-2">{[["Valor X","valueOffsetX"],["Valor Y","valueOffsetY"]].map(([lbl,key])=>(<div key={key}><label className="block text-[10px] text-slate-500">{lbl}</label><input type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]" value={currentSettings[key]??0} onChange={(e)=>updateSettings({[key]:Number(e.target.value)||0})}/></div>))}</div><label className="inline-flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400" checked={currentSettings.showValue!==false} onChange={(e)=>updateSettings({showValue:e.target.checked})}/>Mostrar valor</label></div>)}
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <p className="text-sm font-semibold text-slate-700">Propiedades</p>
      <span className="text-[11px] text-slate-500">Selecciona un icono del canvas.</span>
    </div>
  );

  const renderContent = () => (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
      <nav className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={["min-w-[72px] px-4 py-2 text-[12px] font-medium transition-colors border border-transparent rounded-t-sm", active?"bg-slate-100 text-slate-900 border-slate-300 border-b-2 border-b-sky-500":"bg-white text-slate-600 hover:text-slate-900"].join(" ")}>
              {tab}
            </button>
          );
        })}
      </nav>
      <div className="bg-white border border-slate-200 border-t-0 rounded-sm p-4 min-h-[240px]">
        {activeTab==="General"     && renderGeneral()}
        {activeTab==="Dispositivo" && renderDispositivo()}
        {activeTab==="Estilo"      && renderEstilo()}
      </div>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
