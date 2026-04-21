import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { WIDGET_CATALOG } from "@/modules/organizarScada/components/widgets/catalog/catalog";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import WidgetThumbnail from "@/modules/organizarScada/components/widgets/WidgetThumbnail";

/**
 * Definimos el orden exacto de las categorías para que la UI 
 * no las ordene al azar (según aparezcan en el catálogo).
 */
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

const PREVIEW_W = 110;
const PREVIEW_H = 80;

const ElementsTab = ({ addComponentToCanvas }) => {
  // 1. Generamos SCADA_GROUPS dentro del componente respetando el orden estético
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
        icon: w.icon,
        thumbnailType: "preview",
        data: {
          type: w.type,
          width: w.size?.w || 200,
          height: w.size?.h || 200,
          label: w.label,
          settings: { ...w.defaults },
        },
      });
    });

    // Ordenamos según GROUP_ORDER y filtramos los que no tengan items
    return GROUP_ORDER.filter(id => groups[id])
                      .map(id => groups[id])
                      .concat(Object.values(groups).filter(g => !GROUP_ORDER.includes(g.id)));
  }, []);

  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(scadaGroups.map((group, index) => [group.id, index === 0]))
  );

  const handleTemplateDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const renderTemplatePreview = (tpl) => {
    if (tpl.thumbnailType === "icon") {
      return <WidgetThumbnail icon={tpl.icon} type={tpl.data?.type} />;
    }

    const naturalW = tpl.data?.width || PREVIEW_W;
    const naturalH = tpl.data?.height || PREVIEW_H;
    const scale = Math.min(PREVIEW_W / naturalW, PREVIEW_H / naturalH) * 0.9; // 0.9 para dejar un pequeño margen

    return (
      <div style={{
          width: PREVIEW_W,
          height: PREVIEW_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
        <div style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: "center center",
          width: naturalW,
          height: naturalH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {renderWidget({
            data: tpl.data,
            live: { value: tpl.data?.settings?.initialValue, unit: tpl.data?.settings?.unit },
            width: naturalW,
            height: naturalH,
            valueHistory: [],
          })}
        </div>
      </div>
    );
  };

  const toggleGroup = (groupId) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Plantillas SCADA
        </p>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {scadaGroups.reduce((count, group) => count + group.items.length, 0)}
        </span>
      </div>

      <div className="space-y-2">
        {scadaGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={group.id} className="overflow-hidden rounded-xl border border-slate-300/60 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-slate-100/80"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Categoria</div>
                  <div className="text-sm font-semibold text-slate-700">{group.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                    {group.items.length}
                  </span>
                  <GroupIcon className="h-4 w-4 text-slate-500" />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((tpl) => (
                      <div
                        key={tpl.id}
                        draggable
                        onDragStart={(e) => handleTemplateDragStart(e, tpl)}
                        onClick={() => addComponentToCanvas?.(tpl.data)}
                        className="cursor-grab select-none rounded-lg border border-slate-300/60 bg-slate-50 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                      >
                        <div className="w-full overflow-hidden flex items-center justify-center pointer-events-none">
                          {renderTemplatePreview(tpl)}
                        </div>
                      </div>
                    ))}
                  </div>
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