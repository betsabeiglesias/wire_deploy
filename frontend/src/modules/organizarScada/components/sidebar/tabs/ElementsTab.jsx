// src/modules/organizarScada/components/sidebar/tabs/ElementsTab.jsx
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useHmiTheme } from "../../widgets/styles/ThemeProvider";
import { WIDGET_CATALOG } from "../../widgets/catalog/catalog";
import { renderWidget } from "../../widgets/registry.jsx";

const GROUP_ORDER = ["proceso", "gauges", "barras", "tarjetas", "graficas", "minis", "otros"];
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
  const { theme } = useHmiTheme();
  
  // 1. Generamos los grupos respetando el orden y los nombres del catálogo
  const scadaGroups = useMemo(() => {
    const groups = {};

    WIDGET_CATALOG.forEach((w) => {
      const gId = w.group || "otros";
      if (!groups[gId]) {
        groups[gId] = {
          id: gId,
          label: GROUP_LABELS[gId] || gId.toUpperCase(),
          items: [],
        };
      }

      groups[gId].items.push({
        id: `tpl-${w.type}-${Math.random().toString(36).substr(2, 5)}`,
        title: w.label,
        data: {
          type: w.type,
          width: w.size?.w || 200,
          height: w.size?.h || 200,
          label: w.label,
          settings: { ...w.defaults },
        },
      });
    });

    return GROUP_ORDER.filter(id => groups[id])
                      .map(id => groups[id])
                      .concat(Object.values(groups).filter(g => !GROUP_ORDER.includes(g.id)));
  }, []);

  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(scadaGroups.map((group, index) => [group.id, index === 0]))
  );

  const toggleGroup = (groupId) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const handlePickWidget = (tpl) => {
    if (typeof addComponentToCanvas === "function") {
      addComponentToCanvas(tpl.data);
    }
  };

  const handleDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";

    const dragIcon = e.currentTarget;
    const rect = dragIcon.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragIcon, rect.width / 2, rect.height / 2);
  };

  return (
    <div className="p-4 border rounded-xl transition-all duration-500" 
         style={{ backgroundColor: theme.colors.bgPreview, borderColor: theme.colors.border }}>
      
      {/* LISTADO DE GRUPOS */}
      <div className="space-y-4">
        {scadaGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={group.id} className="overflow-hidden rounded-xl border transition-all" 
                 style={{ backgroundColor: theme.colors.bgWidget, borderColor: theme.colors.border, borderRadius: theme.radius }}>
              
              <button 
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between p-3 hover:bg-black/5 transition-colors"
              >
                <div className="text-left">
                  <div className="text-[9px] font-bold uppercase tracking-tight opacity-50" style={{ color: theme.colors.textMain }}>Categoría</div>
                  <div className="text-sm font-bold" style={{ color: theme.colors.textMain }}>{group.label}</div>
                </div>
                <GroupIcon size={16} style={{ color: theme.colors.textDim }} />
              </button>

              {isExpanded && (
                <div className="grid grid-cols-2 gap-3 p-3 border-t" style={{ borderColor: theme.colors.border }}>
                  {group.items.map((tpl) => (
                    <div
                      key={tpl.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tpl)}
                      onClick={() => handlePickWidget(tpl)}
                      className="group cursor-pointer rounded-lg border p-2 hover:shadow-lg active:scale-95 transition-[box-shadow,transform] duration-200"
                      style={{ 
                        backgroundColor: theme.colors.bgWidget, 
                        borderColor: theme.colors.border, 
                        borderRadius: theme.radius 
                      }}
                    >
                      <div className="flex h-20 items-center justify-center overflow-hidden rounded-md pointer-events-none transition-colors"
                           style={{ backgroundColor: theme.colors.bgPreview }}>
                        <div className="scale-[0.45] origin-center">
                          {renderWidget({ 
                            data: tpl.data, 
                            width: tpl.data.width, 
                            height: tpl.data.height,
                            live: { value: tpl.data.settings?.initialValue, label: tpl.data.label }
                          })}
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
          );
        })}
      </div>
    </div>
  );
};

export default ElementsTab;