// tabs/ElementsTab.jsx

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { WIDGET_CATALOG } from "../../widgets/catalog/catalog";
import { renderWidget } from "../../widgets/registry.jsx";

const GROUP_ORDER = ["proceso", "gauges", "barras", "tarjetas", "graficas", "minis", "otros"];
const GROUP_LABELS = {
  proceso: "Proceso",
  gauges: "Gauges",
  barras: "Barras",
  tarjetas: "Tarjetas",
  graficas: "Graficas",
  minis: "Mini",
  otros: "Otros",
};

const ElementsTab = ({ addComponentToCanvas }) => {
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

    return GROUP_ORDER.filter((id) => groups[id])
      .map((id) => groups[id])
      .concat(Object.values(groups).filter((g) => !GROUP_ORDER.includes(g.id)));
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
    <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-3">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
        Elementos HMI
      </p>

      <div className="space-y-2">
        {scadaGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={group.id} className="overflow-hidden rounded-[4px] border border-slate-300 bg-white">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between px-2 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                    Categoria
                  </div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    {group.label}
                  </div>
                </div>
                <GroupIcon className="h-4 w-4 text-slate-500" />
              </button>

              {isExpanded && (
                <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-2">
                  {group.items.map((tpl) => (
                    <div
                      key={tpl.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tpl)}
                      onClick={() => handlePickWidget(tpl)}
                      className="group cursor-pointer rounded-[4px] border border-slate-300 bg-white p-2 transition-[box-shadow,transform,border-color] duration-200 hover:border-[#29468B] hover:shadow-sm active:scale-95"
                    >
                      <div className="pointer-events-none flex h-20 items-center justify-center overflow-hidden rounded-[4px] bg-[#F2F3F5]">
                        <div className="origin-center scale-[0.45]">
                          {renderWidget({
                            data: tpl.data,
                            width: tpl.data.width,
                            height: tpl.data.height,
                            live: { value: tpl.data.settings?.initialValue, label: tpl.data.label },
                          })}
                        </div>
                      </div>
                      <p className="mt-2 truncate text-center text-[10px] font-semibold text-slate-600">
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
