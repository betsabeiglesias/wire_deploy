// src/modules/organizarScada/hooks/useLiveTag.js
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import useRealtimeStore from "@/store/useRealtimeStore";
import { formatValueWithDecimals } from "@/modules/organizarScada/utils/formatters";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

const FRONT_STALE_THRESHOLD_MS = 10000;

const QUALITY_LEVEL = {
  GOOD: "GOOD",
  UNCERTAIN: "UNCERTAIN",
  BAD: "BAD",
};

function getAgeMs(timestamp, nowMs) {
  if (!timestamp) return null;
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, nowMs - parsed);
}

export default function useLiveTag(tag) {
  // tag puede ser:
  // { source: "connection", tagId: "site1/.../equipo:variable" }
  // { source: "connection", equipment: "x", variable: "y" }   // sin tagId (fallback)
  // { source: "local", initialValue: 42 }
  // null -> sin binding

  const [valueHistory, setValueHistory] = useState([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const connected = useRealtimeStore((s) => s.connected);
  const dataStale = useRealtimeStore((s) => s.dataStale);

  // Selector granular
  const tagId = tag?.source === "connection" ? tag.tagId : null;

  const liveFromMap = useRealtimeStore(
    useShallow((s) => {
      if (!tagId) return null;
      return s.tagsMap.get(tagId) ?? null;
    })
  );

  // Fallback: buscar por equipment+variable cuando no hay tagId explicito
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

  const live = useMemo(() => {
    if (!tag) return { value: undefined };

    if (tag.source === "local") {
      return {
        value: tag.initialValue,
        unit: tag.unit || "",
        source: "local",
        isStatic: true,
      };
    }

    if (tag.source === "connection") {
      return liveFromMap ?? liveFromFallback ?? { value: undefined };
    }

    return { value: undefined };
  }, [tag, liveFromMap, liveFromFallback]);

  useEffect(() => {
    if (tag?.source !== "connection") return undefined;

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [tag?.source]);

  const dataQuality = useMemo(() => {
    if (!tag) {
      return {
        level: QUALITY_LEVEL.GOOD,
        code: "UNBOUND",
        label: "",
        message: "",
        ageMs: null,
        isVisible: false,
      };
    }

    if (tag.source === "local") {
      return {
        level: QUALITY_LEVEL.GOOD,
        code: "LOCAL",
        label: "",
        message: "",
        ageMs: null,
        isVisible: false,
      };
    }

    const ageMs = getAgeMs(live.timestamp, nowMs);
    const backendQuality = String(live.quality || "").toUpperCase();

    if (!connected || dataStale) {
      return {
        level: QUALITY_LEVEL.BAD,
        code: "NO_COMMUNICATION",
        label: "Sin comunicacion PLC",
        message: "No hay comunicacion con el PLC o el gateway realtime.",
        ageMs,
        isVisible: true,
      };
    }

    if (backendQuality === QUALITY_LEVEL.BAD) {
      return {
        level: QUALITY_LEVEL.BAD,
        code: "BAD_QUALITY",
        label: "Dato invalido",
        message: "El ultimo valor recibido no es utilizable.",
        ageMs,
        isVisible: true,
      };
    }

    if (backendQuality === QUALITY_LEVEL.UNCERTAIN || (ageMs !== null && ageMs > FRONT_STALE_THRESHOLD_MS)) {
      const seconds = ageMs !== null ? Math.floor(ageMs / 1000) : null;
      return {
        level: QUALITY_LEVEL.UNCERTAIN,
        code: "FROZEN",
        label: "Dato congelado",
        message: seconds !== null
          ? `El dato no cambia desde hace ${seconds}s.`
          : "El dato no cambia y puede estar congelado.",
        ageMs,
        isVisible: true,
      };
    }

    return {
      level: QUALITY_LEVEL.GOOD,
      code: "GOOD",
      label: "",
      message: "",
      ageMs,
      isVisible: false,
    };
  }, [tag, live.timestamp, live.quality, connected, dataStale, nowMs]);

  const resolvedLive = useMemo(
    () => ({ ...live, dataQuality }),
    [live, dataQuality]
  );

  useEffect(() => {
    if (typeof resolvedLive.value === "undefined") return;
    const timestamp = resolvedLive.timestamp || new Date().toISOString();
    setValueHistory((prev) => {
      const last = prev.at(-1);
      if (last?.timestamp === timestamp && last?.value === resolvedLive.value) return prev;
      return [
        ...prev,
        {
          ...resolvedLive,
          timestamp,
          displayValue: formatValueWithDecimals(resolvedLive.value),
          numericValue: parseNumericValue(resolvedLive.value),
        },
      ].slice(-20);
    });
  }, [resolvedLive]);

  return { live: resolvedLive, valueHistory };
}
