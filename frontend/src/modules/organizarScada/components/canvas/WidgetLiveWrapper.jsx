// src/modules/organizarScada/components/canvas/WidgetLiveWrapper.jsx
import { useMemo } from "react";
import useLiveTag from "@/modules/organizarScada/hooks/useLiveTag";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";

export default function WidgetLiveWrapper({
  data,
  width,
  height,
  theme,
  isLiveMode,
  projectTags,
}) {
  const settings = data?.settings || {};

  // ─────────────────────────────────────────────
  // RESOLUCIÓN DEL TAG (segura)
  // ─────────────────────────────────────────────
  const tag = useMemo(() => {
    if (!isLiveMode) return null;

    // 1. Binding directo
    if (settings.tagId) {
      return { source: "connection", tagId: settings.tagId };
    }

    // 2. Resolución por variableId
    if (settings.variableId && projectTags?.length) {
      return projectTags.find((t) => t.id === settings.variableId) ?? null;
    }

    return null;
  }, [isLiveMode, settings.tagId, settings.variableId, projectTags]);

  // ─────────────────────────────────────────────
  // LIVE DATA (protegido contra null)
  // ─────────────────────────────────────────────
  const { live = {}, valueHistory = [] } = useLiveTag(tag || null);

  // ─────────────────────────────────────────────
  // DEBUG (solo dev)
  // ─────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[WidgetLiveWrapper]",
      {
        type: data?.type,
        tagId: settings.tagId,
        variableId: settings.variableId,
        resolvedTag: tag,
        liveValue: live?.value,
      }
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (!data) return null;

  return renderWidget({
    data,
    live,
    width,
    height,
    theme,
    valueHistory,
    demoNow: Date.now(),
  });
}