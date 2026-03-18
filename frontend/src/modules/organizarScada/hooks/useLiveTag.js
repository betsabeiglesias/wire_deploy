// src/modules/organizarScada/hooks/useLiveTag.js
import { useEffect, useMemo, useState } from "react";
import { useRealtime } from "@/context/RealtimeProvider";
import { formatValueWithDecimals } from "@/modules/organizarScada/utils/formatters";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default function useLiveTag(tag) {
  // tag puede ser:
  // { source: "connection", tagId: "site1/.../equipo:variable" }
  // { source: "local", initialValue: 42 }
  // null → sin binding

  const realtime = useRealtime();
  const tagsMap  = realtime?.tagsMap || new Map();
  const [valueHistory, setValueHistory] = useState([]);

  const live = useMemo(() => {
    if (!tag) return { value: undefined };

    if (tag.source === "local") {
      return {
        value:    tag.initialValue,
        unit:     tag.unit || "",
        source:   "local",
        isStatic: true,
      };
    }

    if (tag.source === "connection") {
      if (tag.tagId) return tagsMap.get(tag.tagId) ?? { value: undefined };
      
      // Fallback para variables sin equipment_id: buscar por equipment + variable
      for (const [, entry] of tagsMap.entries()) {
        if (entry.equipment === tag.equipment && entry.variable === tag.variable) {
          return entry;
        }
      }
      return { value: undefined };
    }
  }, [tagsMap, tag]);

  useEffect(() => {
    if (typeof live.value === "undefined") return;
    const timestamp = live.timestamp || new Date().toISOString();
    setValueHistory((prev) => {
      const last = prev.at(-1);
      if (last?.timestamp === timestamp && last?.value === live.value) return prev;
      return [...prev, {
        ...live,
        timestamp,
        displayValue: formatValueWithDecimals(live.value),
        numericValue: parseNumericValue(live.value),
      }].slice(-20);
    });
  }, [live]);

  return { live, valueHistory };
}