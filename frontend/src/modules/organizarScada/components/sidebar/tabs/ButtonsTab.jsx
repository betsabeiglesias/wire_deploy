// tabs/ButtonsTab.jsx
//
// Sección "Iconos básicos" — buttons, labels, cajas.
// Extraído de UnifiedSidebar.renderSectionContent("buttons").
//
import React from "react";
import { buttons_labels_items } from "@/modules/organizarScada/utils/items";

const getButtonBaseData = (item) => {
  if (item.kind === "button")
    return { type: "nav-button", variant: item.id, label: item.label, targetViewId: null, width: 160, height: 48 };
  if (item.kind === "label")
    return { type: item.id, label: item.label, width: 160, height: 40 };
  return { type: item.id, label: item.label, width: 200, height: 120 };
};

const ButtonsTab = ({ addComponentToCanvas }) => {
  const handleButtonDragStart = (e, item) => {
    e.dataTransfer.setData(
      "application/x-scada-template",
      JSON.stringify({ id: `tpl-${item.id}`, data: getButtonBaseData(item) }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickButton = (item) => addComponentToCanvas?.(getButtonBaseData(item));

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
        Buttons & Labels
      </p>
      <div className="grid grid-cols-2 gap-3">
        {buttons_labels_items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleButtonDragStart(e, item)}
            onClick={() => handlePickButton(item)}
            className="cursor-grab select-none rounded-md border border-slate-300/60 bg-slate-50 px-2 py-2 text-[10px] text-slate-700 hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
          >
            <div className={item.previewClass}>
              {item.kind === "button" ? "Button" : item.kind === "label" ? "Label" : "Caja"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonsTab;
