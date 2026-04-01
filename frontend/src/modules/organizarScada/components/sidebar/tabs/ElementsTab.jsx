// tabs/ElementsTab.jsx
//
// Sección "Iconos HMI" — plantillas SCADA agrupadas.
// Extraído de UnifiedSidebar.renderSectionContent("elements").
//
import React from "react";
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

const renderTemplatePreview = (tpl) => {
  if (tpl.thumbnailType === "icon") {
    return <WidgetThumbnail icon={tpl.icon} type={tpl.data?.type} />;
  }
  return renderWidget({
    data: tpl.data,
    live: { value: undefined, unit: tpl.data?.settings?.unit },
    width: 120,
    height: 90,
    theme: "theme-clean",
    valueHistory: [],
  });
};

const ElementsTab = ({ addComponentToCanvas }) => {
  const handleTemplateDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickTemplate = (tpl) => addComponentToCanvas?.(tpl.data);

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
        Plantillas SCADA
      </p>
      <div className="space-y-3">
        {SCADA_GROUPS.map((group) =>
          group.items.length ? (
            <div key={group.id}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                {group.label}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {group.items.map((tpl) => (
                  <div
                    key={tpl.id}
                    draggable
                    onDragStart={(e) => handleTemplateDragStart(e, tpl)}
                    onClick={() => handlePickTemplate(tpl)}
                    className="cursor-grab select-none rounded-lg border border-slate-300/60 bg-slate-50 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                    title="Arrastra al canvas"
                  >
                    <div className="h-20 w-full overflow-hidden flex items-center justify-center">
                      <div className="pointer-events-none scale-[0.85] origin-center">
                        {renderTemplatePreview(tpl)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default ElementsTab;
