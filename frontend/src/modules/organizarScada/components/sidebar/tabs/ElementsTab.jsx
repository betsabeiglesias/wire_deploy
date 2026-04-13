// tabs/ElementsTab.jsx
//
// Sección "Iconos HMI" — plantillas SCADA agrupadas.
// Extraído de UnifiedSidebar.renderSectionContent("elements").
//
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { elementos_scada } from "@/modules/organizarScada/templates/elementos_scada";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import WidgetThumbnail from "@/modules/organizarScada/components/widgets/WidgetThumbnail";

const SCADA_GROUPS = [
  { id: "gauges",   label: "Gauges",   items: elementos_scada.gauges   || [] },
  { id: "barras",   label: "Barras",   items: elementos_scada.barras   || [] },
  { id: "tarjetas", label: "Tarjetas", items: elementos_scada.tarjetas || [] },
  { id: "graficas", label: "Gráficas", items: elementos_scada.graficas || [] },
  { id: "minis",    label: "Mini",     items: elementos_scada.minis    || [] },
];

const PREVIEW_W = 110;
const PREVIEW_H = 80;

const renderTemplatePreview = (tpl) => {
  if (tpl.thumbnailType === "icon") {
    return <WidgetThumbnail icon={tpl.icon} type={tpl.data?.type} />;
  }

  const naturalW = tpl.data?.width  || PREVIEW_W;
  const naturalH = tpl.data?.height || PREVIEW_H;
  const scale    = Math.min(PREVIEW_W / naturalW, PREVIEW_H / naturalH);

  return (
    <div
      style={{
        width:    PREVIEW_W,
        height:   PREVIEW_H,
        display:  "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        {renderWidget({
          data:         tpl.data,
          live:         { value: tpl.data?.settings?.initialValue, unit: tpl.data?.settings?.unit },
          width:        naturalW,
          height:       naturalH,
          valueHistory: [],
        })}
      </div>
    </div>
  );
};

const ElementsTab = ({ addComponentToCanvas }) => {
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(SCADA_GROUPS.map((group, index) => [group.id, index === 0])),
  );

  const visibleGroups = useMemo(
    () => SCADA_GROUPS.filter((group) => group.items.length),
    [],
  );

  const handleTemplateDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickTemplate = (tpl) => addComponentToCanvas?.(tpl.data);
  const toggleGroup = (groupId) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Plantillas SCADA
        </p>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {visibleGroups.reduce((count, group) => count + group.items.length, 0)}
        </span>
      </div>

      <div className="space-y-2">
        {visibleGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-xl border border-slate-300/60 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-slate-100/80"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Categoria
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {group.label}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                    {group.items.length}
                  </span>
                  <GroupIcon className="h-4 w-4 text-slate-500" />
                </div>
              </button>

              {isExpanded ? (
                <div className="border-t border-slate-200 bg-slate-50/70 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((tpl) => (
                      <div
                        key={tpl.id}
                        draggable
                        onDragStart={(e) => handleTemplateDragStart(e, tpl)}
                        onClick={() => handlePickTemplate(tpl)}
                        className="cursor-grab select-none rounded-lg border border-slate-300/60 bg-slate-50 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                        title={tpl.title || "Arrastra al canvas"}
                      >
                        <div className="w-full overflow-hidden flex items-center justify-center pointer-events-none">
                          {renderTemplatePreview(tpl)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElementsTab;
