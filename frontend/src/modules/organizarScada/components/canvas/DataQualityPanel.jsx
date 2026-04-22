
// import { useEffect, useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import { WifiOff, AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
// import { useShallow } from "zustand/react/shallow";
// import useRealtimeStore from "@/store/useRealtimeStore";

// const STALE_MS = 10_000;

// function resolveTagEntry(el, projectTags, tagsMap) {
//   const s = el.data?.settings || {};
//   if (s.tagId) return { tagId: s.tagId, entry: tagsMap.get(s.tagId) ?? null };
//   if (s.variableId && projectTags?.length) {
//     const pt = projectTags.find((t) => t.id === s.variableId);
//     if (pt?.tagId) return { tagId: pt.tagId, entry: tagsMap.get(pt.tagId) ?? null };
//   }
//   return null;
// }

// function resolveLabel(el, tagId) {
//   const s = el.data?.settings || {};
//   const raw = s.attributeLabel || s.label || "";
//   if (raw) return raw;
//   if (tagId) return tagId.split(":").pop() || tagId;
//   return "Tag desconocido";
// }

// export default function DataQualityPanel({ elements = [], projectTags = [] }) {
//   const connected = useRealtimeStore((s) => s.connected);
//   const dataStale = useRealtimeStore((s) => s.dataStale);
//   const tagsMap = useRealtimeStore(useShallow((s) => s.tagsMap));

//   const [expanded, setExpanded] = useState(true);
//   const [dismissed, setDismissed] = useState(false);
//   const [nowMs, setNowMs] = useState(() => Date.now());

//   useEffect(() => {
//     const id = setInterval(() => setNowMs(Date.now()), 3000);
//     return () => clearInterval(id);
//   }, []);

//   // Reset dismissed whenever issues re-appear after being gone
//   const issues = useMemo(() => {
//     const boundElements = elements.filter((el) => {
//       const s = el.data?.settings || {};
//       return s.tagId || s.variableId;
//     });

//     if (!connected || dataStale) {
//       if (boundElements.length === 0) return [];
//       return [
//         {
//           id: "__global__",
//           level: "BAD",
//           label: "Sin conexión con el sistema realtime",
//           sublabel: dataStale ? "Datos desactualizados" : "WebSocket desconectado",
//         },
//       ];
//     }

//     const seen = new Set();
//     const result = [];

//     for (const el of elements) {
//       const resolved = resolveTagEntry(el, projectTags, tagsMap);
//       if (!resolved) continue;
//       const { tagId, entry } = resolved;
//       if (!entry || seen.has(tagId)) continue;
//       seen.add(tagId);

//       const q = String(entry.quality || "").toUpperCase();
//       const ageMs =
//         entry.timestamp ? nowMs - Date.parse(entry.timestamp) : null;
//       const label = resolveLabel(el, tagId);

//       if (q === "BAD") {
//         result.push({ id: tagId, level: "BAD", label, sublabel: "Dato inválido" });
//       } else if (q === "UNCERTAIN" || (ageMs !== null && ageMs > STALE_MS)) {
//         const secs = ageMs !== null ? Math.floor(ageMs / 1000) : null;
//         result.push({
//           id: tagId,
//           level: "UNCERTAIN",
//           label,
//           sublabel: secs !== null ? `Sin actualizar ${secs}s` : "Dato congelado",
//         });
//       }
//     }

//     return result;
//   }, [elements, projectTags, tagsMap, connected, dataStale, nowMs]);

//   const prevCountRef = useMemo(() => ({ count: 0 }), []);
//   useEffect(() => {
//     if (issues.length > 0 && prevCountRef.count === 0) setDismissed(false);
//     prevCountRef.count = issues.length;
//   }, [issues.length]);

//   if (issues.length === 0 || dismissed) return null;

//   const hasBad = issues.some((i) => i.level === "BAD");
//   const accentColor = hasBad ? "#ef4444" : "#f59e0b";
//   const Icon = hasBad ? WifiOff : AlertTriangle;

//   const panel = (
//     <div
//       style={{
//         position: "fixed",
//         bottom: 20,
//         right: 20,
//         zIndex: 9999,
//         width: 300,
//         background: "rgba(10, 16, 30, 0.97)",
//         border: `1px solid ${accentColor}55`,
//         borderRadius: 10,
//         boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}22`,
//         fontFamily: "'Segoe UI', Arial, sans-serif",
//         overflow: "hidden",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//           padding: "9px 12px",
//           background: `${accentColor}18`,
//           borderBottom: expanded ? `1px solid ${accentColor}33` : "none",
//           cursor: "pointer",
//           userSelect: "none",
//         }}
//         onClick={() => setExpanded((v) => !v)}
//       >
//         <Icon size={14} color={accentColor} strokeWidth={2.5} />
//         <span
//           style={{
//             flex: 1,
//             fontSize: 11,
//             fontWeight: 700,
//             color: accentColor,
//             letterSpacing: "0.05em",
//             textTransform: "uppercase",
//           }}
//         >
//           {issues.length === 1
//             ? "1 señal con problema"
//             : `${issues.length} señales con problemas`}
//         </span>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setDismissed(true);
//           }}
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             color: "#64748b",
//             padding: 2,
//             lineHeight: 0,
//           }}
//           title="Cerrar aviso"
//         >
//           <X size={13} />
//         </button>
//         {expanded ? (
//           <ChevronDown size={13} color="#64748b" />
//         ) : (
//           <ChevronUp size={13} color="#64748b" />
//         )}
//       </div>

//       {/* Issue list */}
//       {expanded && (
//         <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px 0" }}>
//           {issues.map((issue) => {
//             const isGlobal = issue.id === "__global__";
//             const color = issue.level === "BAD" ? "#ef4444" : "#f59e0b";
//             const IssueIcon = issue.level === "BAD" ? WifiOff : AlertTriangle;
//             return (
//               <div
//                 key={issue.id}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   padding: "6px 14px",
//                 }}
//               >
//                 <IssueIcon size={12} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div
//                     style={{
//                       fontSize: isGlobal ? 11 : 10,
//                       fontWeight: isGlobal ? 600 : 500,
//                       color: "#e2e8f0",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     {issue.label}
//                   </div>
//                   <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>
//                     {issue.sublabel}
//                   </div>
//                 </div>
//                 <span
//                   style={{
//                     fontSize: 8,
//                     fontWeight: 700,
//                     letterSpacing: "0.07em",
//                     color,
//                     background: `${color}18`,
//                     border: `1px solid ${color}44`,
//                     borderRadius: 4,
//                     padding: "2px 6px",
//                     flexShrink: 0,
//                   }}
//                 >
//                   {issue.level === "BAD" ? "MALO" : "CONGELADO"}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );

//   return createPortal(panel, document.body);
// }

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  WifiOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import useRealtimeStore from "@/store/useRealtimeStore";

const STALE_MS = 10_000;

function resolveTagEntry(el, projectTags, tagsMap) {
  const s = el.data?.settings || {};

  if (s.tagId) {
    return { tagId: s.tagId, entry: tagsMap.get(s.tagId) ?? null };
  }

  if (s.variableId && projectTags?.length) {
    const pt = projectTags.find((t) => t.id === s.variableId);
    if (pt?.tagId) {
      return { tagId: pt.tagId, entry: tagsMap.get(pt.tagId) ?? null };
    }
  }

  return null;
}

function resolveLabel(el, tagId) {
  const s = el.data?.settings || {};
  const raw = s.attributeLabel || s.label || "";
  if (raw) return raw;
  if (tagId) return tagId.split(":").pop() || tagId;
  return "Tag desconocido";
}

export default function DataQualityPanel({
  elements = [],
  projectTags = [],
}) {
  const connected = useRealtimeStore((s) => s.connected);
  const dataStale = useRealtimeStore((s) => s.dataStale);
  const tagsMap = useRealtimeStore(useShallow((s) => s.tagsMap));

  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 3000);
    return () => clearInterval(id);
  }, []);

  const issues = useMemo(() => {
    const boundElements = elements.filter((el) => {
      const s = el.data?.settings || {};
      return s.tagId || s.variableId;
    });

    // 🔴 Problema global
    if (!connected || dataStale) {
      if (boundElements.length === 0) return [];
      return [
        {
          id: "__global__",
          level: "BAD",
          label: "Sin conexión con el sistema",
          sublabel: dataStale
            ? "Datos desactualizados"
            : "WebSocket desconectado",
        },
      ];
    }

    const seen = new Set();
    const result = [];

    for (const el of elements) {
      const resolved = resolveTagEntry(el, projectTags, tagsMap);
      if (!resolved) continue;

      const { tagId, entry } = resolved;

      if (seen.has(tagId)) continue;
      seen.add(tagId);

      const label = resolveLabel(el, tagId);

      // 🚫 NO DATA (clave)
      if (!entry) {
        result.push({
          id: tagId,
          level: "NO_DATA",
          label,
          sublabel: "Sin datos (tag no está reportando)",
        });
        continue;
      }

      const q = String(entry.quality || "").toUpperCase();
      const ageMs = entry.timestamp
        ? nowMs - Date.parse(entry.timestamp)
        : null;

      if (q === "BAD") {
        result.push({
          id: tagId,
          level: "BAD",
          label,
          sublabel: "Dato inválido",
        });
      } else if (!entry.timestamp) {
        result.push({
          id: tagId,
          level: "UNCERTAIN",
          label,
          sublabel: "Sin timestamp",
        });
      } else if (ageMs > STALE_MS) {
        result.push({
          id: tagId,
          level: "UNCERTAIN",
          label,
          sublabel: `Sin actualizar ${Math.floor(ageMs / 1000)}s`,
        });
      }
    }

    return result;
  }, [elements, projectTags, tagsMap, connected, dataStale, nowMs]);

  const prevCountRef = useMemo(() => ({ count: 0 }), []);

  useEffect(() => {
    if (issues.length > 0 && prevCountRef.count === 0) {
      setDismissed(false);
    }
    prevCountRef.count = issues.length;
  }, [issues.length]);

  if (issues.length === 0 || dismissed) return null;

  const hasBad = issues.some(
    (i) => i.level === "BAD" || i.level === "NO_DATA"
  );

  const accentColor = hasBad ? "#ef4444" : "#f59e0b";

  const Icon = hasBad ? WifiOff : AlertTriangle;

  const panel = (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 300,
        background: "rgba(10, 16, 30, 0.97)",
        border: `1px solid ${accentColor}55`,
        borderRadius: 10,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px " +
          accentColor +
          "22",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: `${accentColor}18`,
          borderBottom: expanded
            ? `1px solid ${accentColor}33`
            : "none",
          cursor: "pointer",
        }}
      >
        <Icon size={14} color={accentColor} strokeWidth={2.5} />

        <span
          style={{
            flex: 1,
            fontSize: 11,
            fontWeight: 700,
            color: accentColor,
            textTransform: "uppercase",
          }}
        >
          {issues.length === 1
            ? "1 señal con problema"
            : `${issues.length} señales con problemas`}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <X size={13} />
        </button>

        {expanded ? (
          <ChevronDown size={13} color="#64748b" />
        ) : (
          <ChevronUp size={13} color="#64748b" />
        )}
      </div>

      {/* Listado */}
      {expanded && (
        <div style={{ maxHeight: 240, overflowY: "auto" }}>
          {issues.map((issue) => {
            const isGlobal = issue.id === "__global__";

            const color =
              issue.level === "BAD"
                ? "#ef4444"
                : issue.level === "UNCERTAIN"
                ? "#f59e0b"
                : "#64748b"; // NO_DATA

            const IssueIcon =
              issue.level === "BAD"
                ? WifiOff
                : issue.level === "UNCERTAIN"
                ? AlertTriangle
                : AlertTriangle;

            const labelMap = {
              BAD: "MALO",
              UNCERTAIN: "CONGELADO",
              NO_DATA: "SIN DATO",
            };

            return (
              <div
                key={issue.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 14px",
                }}
              >
                <IssueIcon
                  size={12}
                  color={color}
                  strokeWidth={2.5}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: isGlobal ? 11 : 10,
                      fontWeight: isGlobal ? 600 : 500,
                      color: "#e2e8f0",
                    }}
                  >
                    {issue.label}
                  </div>

                  <div
                    style={{
                      fontSize: 9,
                      color: "#64748b",
                    }}
                  >
                    {issue.sublabel}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color,
                    background: `${color}18`,
                    border: `1px solid ${color}44`,
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {labelMap[issue.level]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return createPortal(panel, document.body);
}