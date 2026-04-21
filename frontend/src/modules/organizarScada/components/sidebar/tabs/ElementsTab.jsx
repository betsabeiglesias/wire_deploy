import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { HMI_THEME } from "../../widgets/styles/theme";
import { WIDGET_CATALOG } from "../../widgets/catalog/catalog";
import { renderWidget } from "../../widgets/registry.jsx";

const GROUP_LABELS = {
  proceso: "Proceso",
  gauges: "Gauges",
  barras: "Barras",
  tarjetas: "Tarjetas",
  graficas: "Gráficas",
  minis: "Mini",
  otros: "Otros"
};

const ElementsTab = ({ addComponentToCanvas }) => {
  const scadaGroups = useMemo(() => {
    const groups = {};
    WIDGET_CATALOG.forEach((w) => {
      const gId = w.group || "otros";
      if (!groups[gId]) groups[gId] = { id: gId, label: GROUP_LABELS[gId] || gId.toUpperCase(), items: [] };
      groups[gId].items.push({
        id: `tpl-${w.type}-${Math.random().toString(36).substr(2, 5)}`,
        title: w.label,
        data: { type: w.type, width: w.size?.w, height: w.size?.h, settings: { ...w.defaults } }
      });
    });
    return Object.values(groups);
  }, []);

  const [expanded, setExpanded] = useState({ proceso: true });

  return (
    <div className="p-3 border rounded-xl shadow-inner" style={{ backgroundColor: HMI_THEME.colors.bgPreview, borderColor: HMI_THEME.colors.border }}>
      <header className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: HMI_THEME.colors.textDim }}>Librería Centralizada</span>
      </header>

      <div className="space-y-3">
        {scadaGroups.map((group) => (
          <div key={group.id} className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: HMI_THEME.colors.border }}>
            <button 
              onClick={() => setExpanded(p => ({ ...p, [group.id]: !p[group.id] }))}
              className="flex w-full items-center justify-between p-3 transition-colors hover:bg-slate-50"
            >
              <span className="text-sm font-bold" style={{ color: HMI_THEME.colors.textMain }}>{group.label}</span>
              {expanded[group.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {expanded[group.id] && (
              <div className="grid grid-cols-2 gap-3 p-3 border-t" style={{ borderColor: HMI_THEME.colors.border }}>
                {group.items.map((tpl) => (
                  <div
                    key={tpl.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl))}
                    onClick={() => addComponentToCanvas?.(tpl.data)}
                    className="group relative cursor-grab rounded-lg border p-2 transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: HMI_THEME.colors.bgWidget, 
                      borderColor: HMI_THEME.colors.border,
                      borderRadius: HMI_THEME.radius 
                    }}
                  >
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded-md bg-slate-50 pointer-events-none">
                      <div className="scale-[0.45]">
                        {renderWidget({ 
                          data: tpl.data, 
                          width: tpl.data.width, 
                          height: tpl.data.height,
                          live: { value: tpl.data.settings?.initialValue } 
                        })}
                      </div>
                    </div>
                    <p className="mt-2 text-center text-[10px] font-semibold truncate" style={{ color: HMI_THEME.colors.textDim }}>
                      {tpl.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementsTab;