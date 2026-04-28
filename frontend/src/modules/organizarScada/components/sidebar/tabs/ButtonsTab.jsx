// C:\Users\aroa.banuelos\Desktop\wire_deploy\frontend\src\modules\organizarScada\components\sidebar\tabs\ButtonsTab.jsx

import React, { useMemo } from "react";
import { getButtonsLabelsItems } from "@/modules/organizarScada/utils/items";
import { useHmiTheme } from "@/modules/organizarScada/components/widgets/styles/ThemeProvider";

// 🔧 FUNCIÓN CORREGIDA
const getButtonBaseData = (item) => {
  if (item.kind === "button") {
    return {
      type: "nav-button",
      width: 160,
      height: 48,
      settings: {
        variant: item.id,      // ✅ AHORA DENTRO DE settings
        label: item.label,
        targetViewId: null,
      },
    };
  }

  if (item.kind === "label") {
    return {
      type: item.id,
      width: 160,
      height: 40,
      settings: {
        label: item.label,     // ✅ TAMBIÉN AQUÍ
      },
    };
  }

  // shapes / cards / otros
  return {
    type: item.id,
    width: 200,
    height: 120,
    settings: {
      label: item.label || "",
    },
  };
};

const ButtonsTab = ({ addComponentToCanvas }) => {
  const { theme } = useHmiTheme();

  // Items con estilos para preview (sidebar)
  const items = useMemo(() => getButtonsLabelsItems(theme), [theme]);

  const handleButtonDragStart = (e, item) => {
    e.dataTransfer.setData(
      "application/x-scada-template",
      JSON.stringify({
        id: `tpl-${item.id}`,
        data: getButtonBaseData(item), // ✅ YA CORREGIDO
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickButton = (item) => {
    if (typeof addComponentToCanvas === "function") {
      const data = getButtonBaseData(item); // ✅ YA CORREGIDO
      addComponentToCanvas(data);
    }
  };

  return (
    <div
      className="rounded-lg border p-3 transition-colors duration-300"
      style={{
        backgroundColor: theme.colors.bgPreview || "#f8fafc",
        borderColor: theme.colors.border || "#e2e8f0",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-3"
        style={{ color: theme.colors.textMuted || "#94a3b8" }}
      >
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
              backgroundColor: theme.colors.bgWidget || "#ffffff",
              borderColor: theme.colors.border || "#cbd5e1",
              color: theme.colors.text || "#334155",
            }}
          >
            {/* Preview del sidebar */}
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