import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Palette } from "lucide-react";
import { useHmiTheme } from "../../widgets/styles/ThemeProvider";
import { WIDGET_CATALOG } from "../../widgets/catalog/catalog";
import { renderWidget } from "../../widgets/registry.jsx";

const GROUP_LABELS = { proceso: "Proceso", gauges: "Gauges", barras: "Barras", tarjetas: "Tarjetas", minis: "Mini" };

const ElementsTab = ({ addComponentToCanvas }) => {
  const { theme, themeId, setThemeId, allThemes } = useHmiTheme();
  const [expanded, setExpanded] = useState({ proceso: true });

  const scadaGroups = useMemo(() => {
    const groups = {};
    WIDGET_CATALOG.forEach((w) => {
      const gId = w.group || "otros";
      if (!groups[gId]) groups[gId] = { id: gId, label: GROUP_LABELS[gId] || gId.toUpperCase(), items: [] };
      groups[gId].items.push({
        id: `tpl-${w.type}-${Math.random()}`,
        title: w.label,
        data: { type: w.type, width: w.size?.w, height: w.size?.h, settings: { ...w.defaults } }
      });
    });
    return Object.values(groups);
  }, []);

  return (
    <div className="p-4 border rounded-xl transition-all duration-500" 
         style={{ backgroundColor: theme.colors.bgPreview, borderColor: theme.colors.border }}>
      
      {/* HEADER CON DESPLEGABLE */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: theme.colors.textDim }}>
          <Palette size={14} /> Estética del Sistema
        </div>
        
        <select 
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          className="w-full p-2 rounded-lg border text-sm font-medium outline-none transition-all shadow-sm"
          style={{ 
            backgroundColor: theme.colors.bgWidget, 
            borderColor: theme.colors.border, 
            color: theme.colors.textMain 
          }}
        >
          {Object.keys(allThemes).map(id => (
            <option key={id} value={id}>{allThemes[id].label}</option>
          ))}
        </select>
      </div>

      {/* LISTADO DE GRUPOS */}
      <div className="space-y-4">
        {scadaGroups.map((group) => (
          <div key={group.id} className="overflow-hidden rounded-xl border transition-all" 
               style={{ backgroundColor: theme.colors.bgWidget, borderColor: theme.colors.border, borderRadius: theme.radius }}>
            <button 
              onClick={() => setExpanded(p => ({ ...p, [group.id]: !p[group.id] }))}
              className="flex w-full items-center justify-between p-3 hover:bg-black/5"
            >
              <span className="text-sm font-bold" style={{ color: theme.colors.textMain }}>{group.label}</span>
              {expanded[group.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {expanded[group.id] && (
              <div className="grid grid-cols-2 gap-3 p-3 border-t" style={{ borderColor: theme.colors.border }}>
                {group.items.map((tpl) => (
                  <div
                    key={tpl.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl))}
                    className="group cursor-grab rounded-lg border p-2 hover:shadow-lg transition-all"
                    style={{ backgroundColor: theme.colors.bgWidget, borderColor: theme.colors.border, borderRadius: theme.radius }}
                  >
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded-md pointer-events-none"
                         style={{ backgroundColor: theme.colors.bgPreview }}>
                      <div className="scale-[0.45]">
                        {renderWidget({ data: tpl.data, width: tpl.data.width, height: tpl.data.height })}
                      </div>
                    </div>
                    <p className="mt-2 text-center text-[10px] font-bold truncate" style={{ color: theme.colors.textDim }}>
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