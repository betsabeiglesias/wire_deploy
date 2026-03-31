// src/modules/organizarScada/components/sidebar/SidebarPropiedades.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const tabs = ["General", "Dispositivo", "Estilo"];

const panelShellClass =
  "space-y-4 rounded-[24px] border border-[#1f3656] bg-[linear-gradient(180deg,rgba(9,21,47,0.97)_0%,rgba(13,29,64,0.98)_42%,rgba(19,40,87,0.98)_100%)] p-4 text-[#d6e4f5] shadow-[0_30px_60px_-34px_rgba(3,10,24,0.82)] backdrop-blur-sm";
const blockClass =
  "rounded-2xl border border-[#28486f] bg-[rgba(255,255,255,0.05)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";
const labelClass = "block text-[11px] text-[#8ea9c8]";
const inputClass =
  "mt-1 w-full rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.06)] px-2.5 py-2 text-[12px] text-[#eef4ff] placeholder:text-[#7f90a5] focus:border-[#7ec8ff] focus:outline-none";
const compactInputClass =
  "mt-1 w-full rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.06)] px-2 py-1.5 text-[11px] text-[#eef4ff] focus:border-[#7ec8ff] focus:outline-none";
const checkboxClass =
  "h-4 w-4 rounded border-[#355780] bg-[rgba(255,255,255,0.06)] text-[#7ec8ff] focus:ring-[#7ec8ff]";
const colorInputClass =
  "h-10 w-full rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.06)]";

const Field = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const NumberGrid = ({ items, values, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {items.map(([label, key]) => (
      <Field key={key} label={label}>
        <input
          type="number"
          className={compactInputClass}
          value={values[key] ?? 0}
          onChange={(e) => onChange(key, Number(e.target.value) || 0)}
        />
      </Field>
    ))}
  </div>
);

const ColorGrid = ({ items, values, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map(([label, key, fallback]) => (
      <Field key={key} label={label}>
        <input
          type="color"
          className={colorInputClass}
          value={values[key] || fallback}
          onChange={(e) => onChange(key, e.target.value)}
        />
      </Field>
    ))}
  </div>
);

const CheckList = ({ items, values, onChange }) => (
  <div className="flex flex-col gap-1.5">
    {items.map(([label, key, mode = "default"]) => (
      <label key={key} className="inline-flex items-center gap-2 text-[12px] text-[#d6e4f5]">
        <input
          type="checkbox"
          className={checkboxClass}
          checked={mode === "strictTrue" ? values[key] === true : values[key] !== false}
          onChange={(e) => onChange(key, e.target.checked)}
        />
        {label}
      </label>
    ))}
  </div>
);

const SidebarPropiedades = ({
  isOpen = true,
  selectedElement,
  views = [],
  onChange,
  layoutId = null,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("General");
  const [varSearch, setVarSearch] = useState("");
  const [projectTables, setProjectTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");

  const currentLabel =
    selectedElement?.label ??
    selectedElement?.data?.label ??
    selectedElement?.data?.settings?.attributeLabel;
  const currentType = selectedElement?.data?.type || selectedElement?.type;
  const currentSettings = selectedElement?.data?.settings || {};
  const selectedName =
    selectedElement?.data?.name || selectedElement?.name || currentLabel;

  const isTempGauge = currentType === "temp-gauge";
  const isScadaGauge =
    currentType === "hmi-scada-gauge" || currentType === "hmiScadaGauge";
  const isProgressBar = currentType === "hmi-progress-bar";
  const isTankLevel = currentType === "hmi-tank-level";
  const isImageWidget = currentType === "image-widget";
  const isEnergyBar =
    currentType === "hmi-energy-bar" || currentType === "energy-bar";
  const isNavigationButton =
    currentType === "nav-button" ||
    currentType === "btn-primary" ||
    currentType === "btn-outline";

  const currentTargetView =
    selectedElement?.targetViewId ??
    selectedElement?.data?.targetViewId ??
    selectedElement?.data?.settings?.targetViewId ??
    "";

  const updateSettings = (patch) => {
    onChange?.({
      data: {
        ...(selectedElement?.data || {}),
        settings: { ...(currentSettings || {}), ...patch },
      },
    });
  };

  const updateGeometry = (patch) =>
    onChange?.({
      ...patch,
      data: {
        ...(selectedElement?.data || {}),
        width:
          patch?.width !== undefined
            ? patch.width
            : selectedElement?.data?.width,
        height:
          patch?.height !== undefined
            ? patch.height
            : selectedElement?.data?.height,
        settings: { ...(selectedElement?.data?.settings || {}) },
      },
    });

  const rgbaToHex = (value, fallback) => {
    if (!value) return fallback;
    const text = String(value).trim();

    if (text.startsWith("#")) {
      if (text.length === 7) return text;
      if (text.length === 4) {
        return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
      }
      return fallback;
    }

    const match = text.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return fallback;

    const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if ([r, g, b].some(Number.isNaN)) return fallback;

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!layoutId) {
      setProjectTables([]);
      return;
    }

    setLoadingTables(true);
    fetch(`/api/scada/layouts/${layoutId}/tables/`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setProjectTables(Array.isArray(data) ? data : []))
      .catch(() => setProjectTables([]))
      .finally(() => setLoadingTables(false));
  }, [layoutId]);

  useEffect(() => {
    setSelectedTableId(currentSettings.deviceTable || "");
  }, [currentSettings.deviceTable, selectedElement?.id]);

  if (!isOpen) return null;

  const selectedTableObj = projectTables.find(
    (table) => String(table.id) === String(selectedTableId),
  );
  const tableVariables = selectedTableObj?.variables || [];

  const renderGeneral = () => (
    <div className="space-y-3">
      <Field label="Nombre">
        <input
          className={inputClass}
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
                  attributeLabel: e.target.value,
                },
              },
            })
          }
        />
      </Field>

      {isImageWidget && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            Posicion y tamano
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[["X", "x", null], ["Y", "y", null], ["Width", "width", 20], ["Height", "height", 20]].map(
              ([label, key, min]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    min={min ?? undefined}
                    className={compactInputClass}
                    value={Number(
                      key === "x" || key === "y"
                        ? selectedElement?.[key] ?? 0
                        : selectedElement?.data?.[key] ??
                            (key === "width" ? 220 : 180),
                    )}
                    onChange={(e) => {
                      const nextValue =
                        min !== null
                          ? Math.max(min, Number(e.target.value) || min)
                          : Number(e.target.value) || 0;
                      updateGeometry({ [key]: nextValue });
                    }}
                  />
                </Field>
              ),
            )}
          </div>
        </div>
      )}

      {isNavigationButton && (
        <div className={blockClass}>
          <Field label="Vista destino">
            <select
              className={inputClass}
              value={currentTargetView}
              onChange={(e) => {
                const value = e.target.value;
                onChange?.({
                  targetViewId: value,
                  data: {
                    ...(selectedElement?.data || {}),
                    targetViewId: value,
                    settings: {
                      ...(selectedElement?.data?.settings || {}),
                      targetViewId: value,
                    },
                  },
                });
              }}
            >
              <option value="">Selecciona una vista</option>
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name || view.id}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-[10px] text-[#8ea9c8]">
            En produccion este boton navegara a la vista seleccionada.
          </p>
        </div>
      )}

      {!isImageWidget && (
        <>
          <div className={blockClass}>
            <div className="grid grid-cols-2 gap-3">
              {[["Min", "min"], ["Max", "max"]].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    className={inputClass}
                    value={
                      typeof currentSettings[key] === "number"
                        ? currentSettings[key]
                        : ""
                    }
                    onChange={(e) =>
                      updateSettings({
                        [key]:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className={blockClass}>
            <CheckList
              items={[
                ["Ver nombre", "showLabel"],
                ["Mostrar valor del SVG", "showValue"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderDispositivo = () => {
    const linkedVarId = currentSettings.variableId || "";
    const linkedVar = tableVariables.find(
      (variable) => variable.variable_id === linkedVarId,
    );

    const filteredVariables = tableVariables.filter((variable) => {
      if (!varSearch.trim()) return true;
      const query = varSearch.toLowerCase();
      return (
        variable.name?.toLowerCase().includes(query) ||
        variable.equipment?.toLowerCase().includes(query) ||
        variable.variable?.toLowerCase().includes(query)
      );
    });

    return (
      <div className="space-y-3">
        <div className={blockClass}>
          <Field label="Buscar variable">
            <input
              className={inputClass}
              placeholder="Escribe para filtrar..."
              value={varSearch}
              onChange={(e) => setVarSearch(e.target.value)}
            />
          </Field>
        </div>

        <div className={blockClass}>
          <Field label="Tabla">
            {!layoutId ? (
              <p className="mt-2 text-[11px] text-[#f6d78a]">
                Guarda el proyecto primero.
              </p>
            ) : loadingTables ? (
              <p className="mt-2 text-[11px] text-[#8ea9c8]">
                Cargando tablas...
              </p>
            ) : projectTables.length === 0 ? (
              <p className="mt-2 text-[11px] text-[#f6d78a]">
                Sin tablas. Ve a "Dispositivos" para crearlas.
              </p>
            ) : (
              <select
                className={inputClass}
                value={selectedTableId}
                onChange={(e) => {
                  setSelectedTableId(e.target.value);
                  setVarSearch("");
                  updateSettings({
                    deviceTable: e.target.value,
                    variableId: "",
                  });
                }}
              >
                <option value="">Selecciona tabla</option>
                {projectTables.map((table) => (
                  <option key={table.id} value={String(table.id)}>
                    {table.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        {selectedTableId && (
          <div className={blockClass}>
            <Field label="Variable">
              {filteredVariables.length === 0 ? (
                <p className="mt-2 text-[11px] text-[#8ea9c8]">
                  {varSearch
                    ? "Sin coincidencias."
                    : "Sin variables en esta tabla."}
                </p>
              ) : (
                <select
                  className={inputClass}
                  value={linkedVarId}
                  onChange={(e) => {
                    const varId = e.target.value;
                    const meta = tableVariables.find(
                      (variable) => variable.variable_id === varId,
                    );

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
                  {filteredVariables.map((variable) => (
                    <option
                      key={variable.variable_id}
                      value={variable.variable_id}
                    >
                      {variable.name}
                      {variable.source === "connection"
                        ? ` · ${variable.equipment}`
                        : " (local)"}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}

        {linkedVar && (
          <div className={blockClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
              Vinculado
            </p>
            <p className="mt-2 text-[11px] font-semibold text-white">
              {linkedVar.name}
            </p>
            {linkedVar.source === "connection" ? (
              <p className="mt-1 text-[10px] text-[#d6e4f5]">
                {linkedVar.equipment} › {linkedVar.variable}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-[#d6e4f5]">
                Local · {linkedVar.datatype}
                {linkedVar.initial_value != null
                  ? ` = ${linkedVar.initial_value}`
                  : ""}
              </p>
            )}
            {linkedVar.unit && (
              <p className="mt-1 text-[10px] text-[#8ea9c8]">
                Unidad: {linkedVar.unit}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEstilo = () => (
    <div className="space-y-3">
      {!isTempGauge &&
        !isScadaGauge &&
        !isProgressBar &&
        !isTankLevel &&
        !isImageWidget &&
        !isEnergyBar && (
          <div className={blockClass}>
            <div className="text-[12px] text-[#8ea9c8]">
              Este widget no tiene controles de estilo personalizados.
            </div>
          </div>
        )}

      {isImageWidget && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            Image Widget
          </p>
          <Field label={`Opacidad (${Number(currentSettings.opacity ?? 100)}%)`}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              className="mt-2 w-full accent-[#7ec8ff]"
              value={Number(currentSettings.opacity ?? 100)}
              onChange={(e) =>
                updateSettings({ opacity: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <label className="mt-3 inline-flex items-center gap-2 text-[12px] text-[#d6e4f5]">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={currentSettings.lockAspectRatio !== false}
              onChange={(e) =>
                updateSettings({ lockAspectRatio: e.target.checked })
              }
            />
            Mantener relacion de aspecto
          </label>
        </div>
      )}

      {isScadaGauge && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            HMI Scada Gauge
          </p>
          <ColorGrid
            items={[
              ["Color principal", "themeColor", "#94a3b8"],
              ["Color valor", "valueColor", "#ffffff"],
              ["Color unidad", "unitColor", "#64748b"],
            ]}
            values={currentSettings}
            onChange={(key, value) => updateSettings({ [key]: value })}
          />
          <div className="mt-3">
            <NumberGrid
              items={[
                ["Valor X", "valueOffsetX"],
                ["Valor Y", "valueOffsetY"],
                ["Unidad X", "unitOffsetX"],
                ["Unidad Y", "unitOffsetY"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
        </div>
      )}

      {isTempGauge && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            TempGauge
          </p>
          <NumberGrid
            items={[
              ["Label X", "labelOffsetX"],
              ["Label Y", "labelOffsetY"],
              ["Valor X", "valueOffsetX"],
              ["Valor Y", "valueOffsetY"],
            ]}
            values={currentSettings}
            onChange={(key, value) => updateSettings({ [key]: value })}
          />
          <label className="mt-3 inline-flex items-center gap-2 text-[12px] text-[#d6e4f5]">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={currentSettings.showMinMax !== false}
              onChange={(e) =>
                updateSettings({ showMinMax: e.target.checked })
              }
            />
            Mostrar min/max
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["Min/Max size", "minMaxFontSize", "number", 11],
              ["Min/Max color", "minMaxColor", "color", "#94a3b8"],
              ["Label color", "labelColor", "color", "#f87171"],
              ["Value color", "valueColor", "color", "#f87171"],
              ["Needle color", "needleColor", "color", "#ffffff"],
              ["Tick color", "tickColor", "color", "#fb923c"],
            ].map(([label, key, type, fallback]) => (
              <Field key={key} label={label}>
                <input
                  type={type}
                  className={type === "color" ? colorInputClass : compactInputClass}
                  value={
                    type === "color"
                      ? rgbaToHex(currentSettings[key], fallback)
                      : currentSettings[key] ?? fallback
                  }
                  onChange={(e) =>
                    updateSettings({
                      [key]:
                        type === "number"
                          ? Number(e.target.value) || fallback
                          : e.target.value,
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      {isProgressBar && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            HMI Progress Bar
          </p>
          <ColorGrid
            items={[
              ["Color pista", "trackFill", "#1e2a3e"],
              ["Borde pista", "trackStroke", "#2c6993"],
              ["Gradiente inicio", "gradientFrom", "#3498db"],
              ["Gradiente fin", "gradientTo", "#2980b9"],
              ["Hatch stroke", "hatchStroke", "#2c6993"],
              ["Color valor", "percentColor", "#ffffff"],
            ]}
            values={currentSettings}
            onChange={(key, value) => updateSettings({ [key]: value })}
          />
          <div className="mt-3">
            <NumberGrid
              items={[
                ["Valor X", "valueOffsetX"],
                ["Valor Y", "valueOffsetY"],
                ["Label X", "labelOffsetX"],
                ["Label Y", "labelOffsetY"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
          <div className="mt-3">
            <CheckList
              items={[
                ["Mostrar label", "showLabel", "strictTrue"],
                ["Mostrar valor", "showValue"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
        </div>
      )}

      {isEnergyBar && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            Energy Bar Chart
          </p>
          <ColorGrid
            items={[
              ["Fondo", "bgColor", "#1e272e"],
              ["Grid", "gridColor", "#2f3640"],
              ["Eje", "axisColor", "#57606f"],
              ["Titulo", "titleColor", "#ecf0f1"],
              ["Valor", "valueColor", "#00d2d3"],
              ["Labels eje", "labelColor", "#95a5a6"],
              ["Barra from", "barGradientFrom", "#00d2d3"],
              ["Barra to", "barGradientTo", "#0984e3"],
              ["Barra alerta", "alertBarColor", "#ff7675"],
              ["Color limite", "limitColor", "#d63031"],
            ]}
            values={currentSettings}
            onChange={(key, value) => updateSettings({ [key]: value })}
          />
          <div className="mt-3">
            <CheckList
              items={[
                ["Mostrar titulo", "showTitle"],
                ["Mostrar valor", "showValue"],
                ["Mostrar grid", "showGrid"],
                ["Mostrar limite", "showLimit"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
        </div>
      )}

      {isTankLevel && (
        <div className={blockClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
            HMI Tank Level
          </p>
          <ColorGrid
            items={[
              ["Tank dark", "tankDark", "#1a1f35"],
              ["Tank top", "tankTop", "#252b45"],
              ["Fluid base", "fluidBase", "#8e44ad"],
              ["Gradient from", "gradientFrom", "#9b59b6"],
              ["Gradient to", "gradientTo", "#8e44ad"],
              ["Top from", "topFrom", "#d49cf2"],
              ["Top to", "topTo", "#9b59b6"],
              ["Color valor", "percentColor", "#ffffff"],
              ["Color label", "labelColor", "#e2e8f0"],
            ]}
            values={currentSettings}
            onChange={(key, value) => updateSettings({ [key]: value })}
          />
          <div className="mt-3 grid gap-3">
            <Field label="Label">
              <input
                type="text"
                className={inputClass}
                value={currentSettings.label || ""}
                onChange={(e) => updateSettings({ label: e.target.value })}
              />
            </Field>
            <Field label="Fuente">
              <input
                type="text"
                className={inputClass}
                value={currentSettings.fontFamily || "Arial, sans-serif"}
                onChange={(e) =>
                  updateSettings({ fontFamily: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="mt-3">
            <NumberGrid
              items={[
                ["Valor X", "valueOffsetX"],
                ["Valor Y", "valueOffsetY"],
              ]}
              values={currentSettings}
              onChange={(key, value) => updateSettings({ [key]: value })}
            />
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-[12px] text-[#d6e4f5]">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={currentSettings.showValue !== false}
              onChange={(e) => updateSettings({ showValue: e.target.checked })}
            />
            Mostrar valor
          </label>
        </div>
      )}
    </div>
  );

  const renderEmpty = () => (
    <div className={panelShellClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea9c8]">
            Inspector
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Propiedades</p>
        </div>
        {typeof onClose === "function" && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.05)] text-[#d6e4f5] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.12)] hover:text-white"
            aria-label="Cerrar ventana de propiedades"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className={blockClass}>
        <span className="text-[11px] text-[#8ea9c8]">
          Selecciona un icono del canvas.
        </span>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className={panelShellClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea9c8]">
            Inspector
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Propiedades</p>
        </div>
        {typeof onClose === "function" && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.05)] text-[#d6e4f5] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.12)] hover:text-white"
            aria-label="Cerrar ventana de propiedades"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "min-w-[88px] rounded-2xl border px-4 py-2 text-[12px] font-medium transition",
                active
                  ? "border-[#7ec8ff] bg-[linear-gradient(180deg,rgba(34,86,120,0.96)_0%,rgba(25,75,104,0.98)_100%)] text-white shadow-[0_12px_24px_-20px_rgba(25,75,104,0.75)]"
                  : "border-[#355780] bg-[rgba(255,255,255,0.04)] text-[#c8d8eb] hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.1)] hover:text-white",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className={blockClass}>
        {activeTab === "General" && renderGeneral()}
        {activeTab === "Dispositivo" && renderDispositivo()}
        {activeTab === "Estilo" && renderEstilo()}
      </div>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
