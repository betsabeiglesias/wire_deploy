// src/modules/organizarScada/components/canvas/WidgetLiveWrapper.jsx
import { useMemo } from "react";
import useLiveTag from "@/modules/organizarScada/hooks/useLiveTag";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";

export default function WidgetLiveWrapper({
  data,
  width,
  height,
  isLiveMode,
  projectTags,
}) {
  const settings = data?.settings || {};

  // Resolucion del tag (segura)
  const tag = useMemo(() => {
    if (!isLiveMode) return null;

    if (settings.tagId) {
      return { source: "connection", tagId: settings.tagId };
    }

    if (settings.variableId && projectTags?.length) {
      return projectTags.find((t) => t.id === settings.variableId) ?? null;
    }

    return null;
  }, [isLiveMode, settings.tagId, settings.variableId, projectTags]);

  const { live = {}, valueHistory = [] } = useLiveTag(tag || null);

  if (!data) return null;

  return (
    <div style={{ position: "relative", width, height }}>
      {renderWidget({
        data,
        live,
        width,
        height,
        theme,
        valueHistory,
        demoNow: Date.now(),
      })}
    </div>
  );
}
