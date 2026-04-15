// widgets/process/ProcessStatusBadge.jsx
// Indicador de estado operacional: icono + running/stopped/fault con animación CSS.
import { useId } from "react";
import { ICON_MAP } from "../iconMap";

const STATUS_CFG = {
  running: { label: "EN MARCHA", color: "#22c55e", pulse: true  },
  stopped: { label: "PARADO",    color: "#64748b", pulse: false },
  fault:   { label: "FALLO",     color: "#ef4444", pulse: true  },
  standby: { label: "ESPERA",    color: "#f59e0b", pulse: false },
};

const resolveStatus = (value) => {
  if (value === null || value === undefined) return "stopped";
  const v = String(value).toLowerCase().trim();
  if (v === "true" || v === "1" || v === "running" || v === "on") return "running";
  if (v === "fault" || v === "error" || v === "fallo")             return "fault";
  if (v === "standby" || v === "espera" || v === "2")              return "standby";
  return "stopped";
};

export default function ProcessStatusBadge({
  iconKey = "motor",
  label   = "",
  value   = null,
  primary = "#3b82f6",
  width   = 160,
  height  = 130,
}) {
  const uid    = useId().replace(/:/g, "");
  const Icon   = ICON_MAP[iconKey] || ICON_MAP.gauge;
  const status = resolveStatus(value);
  const cfg    = STATUS_CFG[status];

  const keyframes = cfg.pulse ? `
    @keyframes psb-pulse-${uid} {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.55; transform: scale(1.35); }
    }
  ` : "";

  return (
    <div
      style={{
        width, height,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: `1.5px solid ${cfg.color}44`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxSizing: "border-box",
        padding: "10px 12px",
        position: "relative",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Animación CSS */}
      {keyframes && <style>{keyframes}</style>}

      {/* LED de estado */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        width: 10, height: 10, borderRadius: "50%",
        background: cfg.color,
        boxShadow: `0 0 6px ${cfg.color}`,
        animation: cfg.pulse ? `psb-pulse-${uid} 1.4s ease-in-out infinite` : "none",
      }} />

      {/* Icono */}
      <div style={{ color: primary, opacity: 0.95 }}>
        <Icon style={{ width: 44, height: 44 }} strokeWidth={1.4} />
      </div>

      {/* Separador */}
      <div style={{ width: "80%", height: 1, background: "#1e293b" }} />

      {/* Badge de estado */}
      <div style={{
        background: `${cfg.color}22`,
        border: `1px solid ${cfg.color}99`,
        borderRadius: 20,
        padding: "3px 14px",
        fontSize: 10, fontWeight: 700,
        color: cfg.color,
        letterSpacing: "0.08em",
      }}>
        {cfg.label}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 9, color: "#64748b",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {label}
      </div>
    </div>
  );
}
