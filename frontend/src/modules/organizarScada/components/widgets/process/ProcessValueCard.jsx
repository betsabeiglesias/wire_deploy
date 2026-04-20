// widgets/process/ProcessValueCard.jsx
// Tarjeta industrial: icono + valor en vivo + barra de rango.
import { ICON_MAP } from "../iconMap";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function ProcessValueCard({
  iconKey = "pump",
  label = "",
  value = null,
  unit = "",
  min = 0,
  max = 100,
  primary = "#3b82f6",
  qualityState = null,
  width = 200,
  height = 120,
}) {
  const Icon = ICON_MAP[iconKey] || ICON_MAP.gauge;
  const isBad = qualityState?.level === "BAD";
  const isUncertain = qualityState?.level === "UNCERTAIN";
  const numVal = value !== null && value !== undefined ? Number(value) : null;
  const display = isBad
    ? "---"
    : numVal !== null && !Number.isNaN(numVal) ? numVal.toFixed(1) : "-";
  const pct = numVal !== null ? clamp((numVal - min) / (max - min || 1), 0, 1) : 0;
  const accent = isBad ? "#ef4444" : isUncertain ? "#f59e0b" : primary;
  const valueColor = isBad ? "#fca5a5" : isUncertain ? "#fbbf24" : "#f1f5f9";

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: `1px solid ${accent}55`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        padding: "10px 12px 8px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 14,
          bottom: 14,
          width: 3,
          borderRadius: 2,
          background: accent,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={{ color: accent, opacity: 0.9, flexShrink: 0, paddingLeft: 8 }}>
          <Icon style={{ width: 36, height: 36 }} strokeWidth={1.5} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.07em",
              color: "#94a3b8",
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: valueColor, lineHeight: 1.1 }}>
            {display}
          </div>
          {unit && <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{unit}</div>}
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "#1e293b",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${pct * 100}%`,
              background: accent,
              opacity: 0.85,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 8,
            color: "#475569",
            marginTop: 2,
          }}
        >
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
