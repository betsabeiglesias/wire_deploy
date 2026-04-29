import { useId } from "react";
import { ICON_MAP } from "../iconMap";

const STATUS_CFG = {
  running: { label: "EN MARCHA", color: "#22c55e", pulse: true },
  stopped: { label: "PARADO", color: "#64748b", pulse: false },
  fault: { label: "FALLO", color: "#ef4444", pulse: true },
  standby: { label: "ESPERA", color: "#f59e0b", pulse: false },
};

const resolveStatus = (value) => {
  if (value == null) return "stopped";
  const v = String(value).toLowerCase();
  if (["true", "1", "running", "on"].includes(v)) return "running";
  if (["fault", "error", "fallo"].includes(v)) return "fault";
  if (["standby", "espera", "2"].includes(v)) return "standby";
  return "stopped";
};

export default function ProcessStatusBadge({
  iconKey = "motor",
  label = "",
  value = null,

  primaryColor,
  backgroundColor,
  textColor,

  width = 160,
  height = 130,
}) {
  const uid = useId().replace(/:/g, "");
  const Icon = ICON_MAP[iconKey] || ICON_MAP.gauge;

  const status = resolveStatus(value);
  const cfg = STATUS_CFG[status];

  const color = primaryColor || cfg.color;

  const keyframes = cfg.pulse
    ? `@keyframes pulse-${uid} {
        0%,100%{opacity:1;transform:scale(1)}
        50%{opacity:.5;transform:scale(1.3)}
      }`
    : "";

  return (
    <div
      style={{
        width,
        height,
        background: backgroundColor,
        border: `1.5px solid ${color}44`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        position: "relative",
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
          background: color,
          animation: cfg.pulse ? `pulse-${uid} 1.4s infinite` : "none",
        }}
      />

      <div style={{ color }}>
        <Icon style={{ width: 44, height: 44 }} />
      </div>

      <div
        style={{
          background: `${color}22`,
          border: `1px solid ${color}99`,
          borderRadius: 20,
          padding: "3px 14px",
          fontSize: 10,
          fontWeight: 700,
          color,
        }}
      >
        {cfg.label}
      </div>

      <div style={{ fontSize: 9, color: textColor }}>{label}</div>
    </div>
  );
}