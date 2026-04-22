// tabs/ButtonsTab.jsx

import React, { useMemo } from "react";
import { getButtonsLabelsItems } from "@/modules/organizarScada/utils/items";

const getButtonBaseData = (item) => {
  if (item.kind === "button") {
    return {
      type: "nav-button",
      variant: item.id,
      label: item.label,
      targetViewId: null,
      width: 160,
      height: 48,
    };
  }

  if (item.kind === "label") {
    return {
      type: item.id,
      label: item.label,
      width: 160,
      height: 40,
    };
  }

  return {
    type: item.id,
    label: item.label,
    width: 200,
    height: 120,
  };
};

const ButtonsTab = ({ addComponentToCanvas }) => {
  const items = useMemo(() => getButtonsLabelsItems(), []);

  const handleButtonDragStart = (e, item) => {
    e.dataTransfer.setData(
      "application/x-scada-template",
      JSON.stringify({
        id: `tpl-${item.id}`,
        data: getButtonBaseData(item),
      }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickButton = (item) => {
    if (typeof addComponentToCanvas === "function") {
      addComponentToCanvas(getButtonBaseData(item));
    }
  };

  return (
    <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-3 transition-colors duration-300">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
        Buttons & Labels
      </p>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleButtonDragStart(e, item)}
            onClick={() => handlePickButton(item)}
            className="cursor-pointer select-none rounded-[4px] border border-slate-300 bg-white px-2 py-2 text-[10px] text-slate-700 transition-all hover:border-[#29468B] hover:shadow-sm active:scale-95"
          >
            <div
              className={`${item.previewClass} pointer-events-none`}
              style={item.style}
            >
              {item.kind === "button"
                ? "Button"
                : item.kind === "label"
                  ? "Label"
                  : item.label || "Caja"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonsTab;
