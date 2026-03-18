// src/modules/organizarScada/components/canvas/WidgetLiveWrapper.jsx
import { useMemo } from "react";
import useLiveTag from "@/modules/organizarScada/hooks/useLiveTag";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";

export default function WidgetLiveWrapper({ data, width, height, theme, isLiveMode, projectTags }) {
  const settings = data?.settings || {};

  const tag = useMemo(() => {
    if (!isLiveMode) return null;

    // 1. Si tiene tagId directo — usar directamente (binding canónico)
    if (settings.tagId) {
        return { source: "connection", tagId: settings.tagId };
    }

    // 2. Si tiene variableId — buscar en projectTags
    if (settings.variableId && projectTags?.length) {
        return projectTags.find(t => t.id === settings.variableId) ?? null;
    }

    return null;
  }, [isLiveMode, settings.tagId, settings.variableId, projectTags]);

  const { live, valueHistory } = useLiveTag(tag);
    console.log("widget:", data?.type, "| tagId:", settings.tagId, "| variableId:", settings.variableId, "| tag:", tag, "| live.value:", live.value);
  return renderWidget({ data, live, width, height, theme, valueHistory, demoNow: Date.now() });
}