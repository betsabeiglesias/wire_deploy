// widgets/process/ProcessStatusBadge.jsx
// Indicador de estado operacional: icono + running/stopped/fault con animacion CSS.
import { useId } from "react";
import { ICON_MAP } from "../iconMap";

const STATUS_CFG = {
  running: { label: "EN MARCHA", color: "#22c55e", pulse: true },
  stopped: { label: "PARADO", color: "#64748b", pulse: false },
  fault: { label: "FALLO", color: "#ef4444", pulse: true },
  standby: { label: "ESPERA", color: "#f59e0b", pulse: false },
};

const resolveStatus = (value) => {
  if (value === null || value === undefined) return "stopped";
  const v = String(value).toLowerCase().trim();
  if (v === "true" || v === "1" || v === "running" || v === "on") return "running";
  if (v === "fault" || v === "error" || v === "fallo") return "fault";
  if (v === "standby" || v === "espera" || v === "2") return "standby";
  return "stopped";
};

export default function ProcessStatusBadge({
  iconKey = "motor",
  label = "",
  value = null,
  primary = "#3b82f6",
  qualityState = null,
  width = 160,
  height = 130,
}) {
  const uid = useId().replace(/:/g, "");
  const Icon = ICON_MAP[iconKey] || ICON_MAP.gauge;
  const status = resolveStatus(value);
  const cfg = STATUS_CFG[status];
  const isBad = qualityState?.level === "BAD";
  const isUncertain = qualityState?.level === "UNCERTAIN";
  const badgeColor = isBad ? "#ef4444" : isUncertain ? "#f59e0b" : cfg.color;
  const badgeLabel = isBad ? "SIN COMUNICACION" : isUncertain ? "DATO CONGELADO" : cfg.label;

  const keyframes = cfg.pulse && !isBad && !isUncertain
    ? `
    @keyframes psb-pulse-${uid} {
      0%,100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.55; transform: scale(1.35); }
    }
  `
    : "";

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: `1.5px solid ${badgeColor}44`,
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
      {keyframes && <style>{keyframes}</style>}

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: badgeColor,
          boxShadow: `0 0 6px ${badgeColor}`,
          animation: cfg.pulse && !isBad && !isUncertain ? `psb-pulse-${uid} 1.4s ease-in-out infinite` : "none",
        }}
      />

      <div style={{ color: primary, opacity: 0.95 }}>
        <Icon style={{ width: 44, height: 44 }} strokeWidth={1.4} />
      </div>

      <div style={{ width: "80%", height: 1, background: "#1e293b" }} />

      <div
        style={{
          background: `${badgeColor}22`,
          border: `1px solid ${badgeColor}99`,
          borderRadius: 20,
          padding: "3px 14px",
          fontSize: 10,
          fontWeight: 700,
          color: badgeColor,
          letterSpacing: "0.08em",
        }}
      >
        {badgeLabel}
      </div>

      <div
        style={{
          fontSize: 9,
          color: "#64748b",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {label}
      </div>
    </div>
  );
}
