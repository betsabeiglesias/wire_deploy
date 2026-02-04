// SidebarPropiedades.jsx
// Panel de propiedades con tabs horizontales ligeros (estilo barra clara).
import React, { useMemo, useState } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";

const tabs = ["General", "Dispositivo", "Estilo"];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const currentLabel =
    selectedElement?.label ??
    selectedElement?.data?.label ??
    selectedElement?.data?.settings?.attributeLabel;
  const currentType = selectedElement?.data?.type || selectedElement?.type;
  const currentSettings = selectedElement?.data?.settings || {};
  const selectedName =
    selectedElement?.data?.name || selectedElement?.name || currentLabel;

  const isTempGauge = currentType === "temp-gauge";

  const updateSettings = (patch) =>
    onChange?.({
      data: {
        ...(selectedElement?.data || {}),
        settings: { ...(currentSettings || {}), ...patch },
      },
    });

  const rgbaToHex = (value, fallback) => {
    if (!value) return fallback;
    const trimmed = String(value).trim();
    if (trimmed.startsWith("#")) {
      if (trimmed.length === 7) return trimmed;
      if (trimmed.length === 4) {
        return (
          "#" +
          trimmed[1] +
          trimmed[1] +
          trimmed[2] +
          trimmed[2] +
          trimmed[3] +
          trimmed[3]
        );
      }
      return fallback;
    }
    const match = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return fallback;
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    if ([r, g, b].some((v) => Number.isNaN(v))) return fallback;
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const tables = useMemo(() => {
    const raw = allTags.map((t) => t.table || t.device || t.site || "").filter(Boolean);
    return Array.from(new Set(raw)).sort();
  }, [allTags]);

  const filteredTags = useMemo(() => {
    const term = (searchTerm || "").toLowerCase().trim();
    return allTags.filter((t) => {
      const tableKey = t.table || t.device || t.site || "";
      if (selectedTable && tableKey !== selectedTable) return false;
      const label =
        (t.variable || t.tag || t.name || t.attributeKey || "").toString();
      if (!term) return true;
      return label.toLowerCase().includes(term);
    });
  }, [allTags, selectedTable, searchTerm]);

  const tagOptions = useMemo(() => {
    return filteredTags.map((t) => {
      const value = t.tag || t.variable || t.name || t.attributeKey || "";
      const unit = t.unit ? ` (${t.unit})` : "";
      return {
        value,
        label: `${value}${unit}`,
      };
    });
  }, [filteredTags]);

  if (!isOpen) return null;

  const renderEmpty = () => (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-700">Propiedades</p>
        <span className="text-[11px] text-slate-500">Selecciona un elemento del canvas.</span>
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] text-slate-600">Nombre</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-600">Min</label>
          <input
            type="number"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            value={
              typeof currentSettings.min === "number" ? currentSettings.min : ""
            }
            onChange={(e) =>
              updateSettings({
                min: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-600">Max</label>
          <input
            type="number"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            value={
              typeof currentSettings.max === "number" ? currentSettings.max : ""
            }
            onChange={(e) =>
              updateSettings({
                max: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
          checked={currentSettings.showLabel !== false}
          onChange={(e) => updateSettings({ showLabel: e.target.checked })}
        />
        Visualizar nombre
      </label>

      <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
          checked={currentSettings.showValue !== false}
          onChange={(e) => updateSettings({ showValue: e.target.checked })}
        />
        Mostrar valor del SVG
      </label>
    </div>
  );

  const renderDispositivo = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] text-slate-600">Buscar tag</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre de tag..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-600">Tabla</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value);
              setSelectedTag("");
              updateSettings({ deviceTable: e.target.value, deviceTag: "" });
            }}
          >
            <option value="">Todas</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-600">Tag</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px] focus:border-sky-400 focus:outline-none"
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              updateSettings({ deviceTag: e.target.value });
            }}
          >
            <option value="">Selecciona un tag</option>
            {tagOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Filtra por tabla y selecciona un tag para enlazar el widget.
      </p>
    </div>
  );

  const renderEstilo = () => (
    <div className="space-y-3">
      {!isTempGauge && (
        <div className="text-[12px] text-slate-500">
          Este widget no tiene controles de estilo personalizados.
        </div>
      )}

      {isTempGauge && (
        <div className="rounded border border-slate-200 bg-white p-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            TempGauge
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500">Label X</label>
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                value={currentSettings.labelOffsetX ?? 0}
                onChange={(e) =>
                  updateSettings({ labelOffsetX: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Label Y</label>
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                value={currentSettings.labelOffsetY ?? 0}
                onChange={(e) =>
                  updateSettings({ labelOffsetY: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Valor X</label>
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                value={currentSettings.valueOffsetX ?? 0}
                onChange={(e) =>
                  updateSettings({ valueOffsetX: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Valor Y</label>
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                value={currentSettings.valueOffsetY ?? 0}
                onChange={(e) =>
                  updateSettings({ valueOffsetY: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              checked={currentSettings.showMinMax !== false}
              onChange={(e) => updateSettings({ showMinMax: e.target.checked })}
            />
            Mostrar min/max
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500">Min/Max size</label>
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                value={currentSettings.minMaxFontSize ?? 11}
                onChange={(e) =>
                  updateSettings({ minMaxFontSize: Number(e.target.value) || 11 })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Min/Max color</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.minMaxColor, "#94a3b8")}
                onChange={(e) => updateSettings({ minMaxColor: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500">Label color</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.labelColor, "#f87171")}
                onChange={(e) => updateSettings({ labelColor: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Value color</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.valueColor, "#f87171")}
                onChange={(e) => updateSettings({ valueColor: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Needle color</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.needleColor, "#ffffff")}
                onChange={(e) => updateSettings({ needleColor: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Tick color</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.tickColor, "#fb923c")}
                onChange={(e) => updateSettings({ tickColor: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500">Arco inicio</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.arcStartColor, "#fb923c")}
                onChange={(e) => updateSettings({ arcStartColor: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Arco medio</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.arcMidColor, "#f97316")}
                onChange={(e) => updateSettings({ arcMidColor: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Arco fin</label>
              <input
                type="color"
                className="mt-1 h-9 w-full rounded border border-slate-300 px-2 py-1"
                value={rgbaToHex(currentSettings.arcEndColor, "#ef4444")}
                onChange={(e) => updateSettings({ arcEndColor: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === "General") return renderGeneral();
    if (activeTab === "Dispositivo") return renderDispositivo();
    if (activeTab === "Estilo") return renderEstilo();
    return null;
  };

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
      </nav>

      <div className="bg-white border border-slate-200 border-t-0 rounded-sm p-4 min-h-[240px]">
        {renderTabContent()}
      </div>
    </div>
  );

  return selectedElement ? renderContent() : renderEmpty();
};

export default SidebarPropiedades;
