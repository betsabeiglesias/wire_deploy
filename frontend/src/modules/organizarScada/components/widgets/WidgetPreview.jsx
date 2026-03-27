// src/modules/organizarScada/components/widgets/WidgetPreview.jsx

import React, { useMemo } from "react";
import { renderWidget } from "./registry";

export default function WidgetPreview({
  data,
  unit,
  width = 80,
  height = 80,
}) {
  // 🔥 evitar re-render innecesario
  const previewLive = useMemo(() => {
    return {
      value: 72, // valor fake estable
      unit: unit || data?.settings?.unit || "",
    };
  }, [unit, data?.settings?.unit]);


    const widget = renderWidget({
    data,
    live: previewLive,
    width,
    height,
    preview: true,
    valueHistory: [],
    });

  return (
    <div className="flex items-center justify-center w-full h-full bg-white">
      <div className="scale-[0.85] origin-center pointer-events-none">
        {widget}
      </div>
    </div>
  );
}