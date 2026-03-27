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
      unit: unit || "",
    };
  }, [unit]);

  // 🔥 evitar recalcular renderWidget cada render
    const widget = useMemo(() => {
    if (!data) return null;

    const safeData = {
        ...data,
        settings: { ...(data.settings || {}) },
    };

    return renderWidget({
        data: safeData,
        live: previewLive,
        width,
        height,
        preview: true,
        valueHistory: [],
    });
    }, [
    JSON.stringify(data.settings),
    previewLive,
    width,
    height,
    ]);
}