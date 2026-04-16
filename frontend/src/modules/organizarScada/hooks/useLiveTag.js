// src/modules/organizarScada/hooks/useLiveTag.js
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import useRealtimeStore from "@/store/useRealtimeStore";
import { formatValueWithDecimals } from "@/modules/organizarScada/utils/formatters";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default function useLiveTag(tag) {
  // tag puede ser:
  // { source: "connection", tagId: "site1/.../equipo:variable" }
  // { source: "connection", equipment: "x", variable: "y" }   // sin tagId (fallback)
  // { source: "local", initialValue: 42 }
  // null → sin binding

  const [valueHistory, setValueHistory] = useState([]);

  // ── Selector granular ──────────────────────────────────────────────────────
  // useShallow hace una comparación superficial del objeto devuelto, de modo
  // que el componente solo se re-renderiza si alguno de los campos del entry
  // (value, unit, timestamp…) cambia de valor, no por un simple cambio de
  // referencia de Map/objeto.
  const tagId = tag?.source === "connection" ? tag.tagId : null;

  const liveFromMap = useRealtimeStore(
    useShallow((s) => {
      if (!tagId) return null;
      return s.tagsMap.get(tagId) ?? null;
    })
  );

  // Fallback: buscar por equipment+variable cuando no hay tagId explícito
  const liveFromFallback = useRealtimeStore(
    useShallow((s) => {
      if (tagId || tag?.source !== "connection") return null;
      if (!tag?.equipment && !tag?.variable) return null;
      for (const entry of s.tagsMap.values()) {
        if (entry.equipment === tag.equipment && entry.variable === tag.variable) {
          return entry;
        }
      }
      return null;
    })
  );

  // ── Valor resuelto ─────────────────────────────────────────────────────────
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
      return liveFromMap ?? liveFromFallback ?? { value: undefined };
    }

    return { value: undefined };
  }, [tag, liveFromMap, liveFromFallback]);

  // ── Historial de valores (últimos 20 puntos) ───────────────────────────────
  useEffect(() => {
    if (typeof live.value === "undefined") return;
    const timestamp = live.timestamp || new Date().toISOString();
    setValueHistory((prev) => {
      const last = prev.at(-1);
      if (last?.timestamp === timestamp && last?.value === live.value) return prev;
      return [
        ...prev,
        {
          ...live,
          timestamp,
          displayValue: formatValueWithDecimals(live.value),
          numericValue: parseNumericValue(live.value),
        },
      ].slice(-20);
    });
  }, [live]);

  return { live, valueHistory };
}
