// src/modules/organizarScada/components/sidebar/tabs/ButtonsTab.jsx
import React, { useMemo } from "react";
import { getButtonsLabelsItems } from "@/modules/organizarScada/utils/items";
import { useHmiTheme } from "@/modules/organizarScada/components/widgets/styles/ThemeProvider";

const getButtonBaseData = (item) => {
  // Ahora el type es el id (ej: 'btn-primary', 'shape-rect', etc.)
  // Esto permite que el registry encuentre la definición correcta
  return {
    type: item.id, 
    width: item.kind === "button" ? 160 : (item.kind === "label" ? 160 : 200),
    height: item.kind === "button" ? 48 : (item.kind === "label" ? 40 : 120),
    label: item.label, // Label raíz por si acaso
    settings: {
      label: item.label,
      variant: item.id,
      kind: item.kind,
      // Pasamos el estilo original de items.js como default en settings
      style: item.style, 
      previewClass: item.previewClass,
    },
  };
};

const ButtonsTab = ({ addComponentToCanvas }) => {
  const { theme } = useHmiTheme();
  const items = useMemo(() => getButtonsLabelsItems(theme), [theme]);

  const handleButtonDragStart = (e, item) => {
    e.dataTransfer.setData(
      "application/x-scada-template",
      JSON.stringify({
        id: `tpl-${item.id}-${Math.random().toString(36).substr(2, 5)}`,
        data: getButtonBaseData(item),
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickButton = (item) => {
    if (typeof addComponentToCanvas === "function") {
      addComponentToCanvas(getButtonBaseData(item));
    }
  };

  return (
    <div className="rounded-lg border p-3" style={{ backgroundColor: theme.colors.bgPreview, borderColor: theme.colors.border }}>
      <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: theme.colors.textMuted }}>
        Buttons & Labels
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleButtonDragStart(e, item)}
            onClick={() => handlePickButton(item)}
            className="cursor-pointer select-none rounded-md border px-2 py-2 text-[10px] transition-all hover:shadow-md hover:border-sky-400 active:scale-95"
            style={{ 
              backgroundColor: theme.colors.bgWidget, 
              borderColor: theme.colors.border, 
              color: theme.colors.text 
            }}
          >
            <div className={`${item.previewClass} pointer-events-none`} style={item.style}>
              {item.label || item.kind}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonsTab;