// widgets/process/ProcessLevelCard.jsx
// Nivel vertical con relleno animado: tanques, depósitos, mezcladores.
import { ICON_MAP } from "../iconMap";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const levelColor = (pct) => {
  if (pct >= 0.85) return "#ef4444";
  if (pct >= 0.65) return "#f59e0b";
  return "#22c55e";
};

export default function ProcessLevelCard({
  iconKey = "tank",
  label   = "",
  value   = null,
  unit    = "%",
  min     = 0,
  max     = 100,
  primary = "#3b82f6",
  width   = 160,
  height  = 200,
}) {
  const Icon    = ICON_MAP[iconKey] || ICON_MAP.tank;
  const numVal  = value !== null && value !== undefined ? Number(value) : null;
  const display = numVal !== null && !Number.isNaN(numVal) ? numVal.toFixed(1) : "—";
  const pct     = numVal !== null ? clamp((numVal - min) / (max - min || 1), 0, 1) : 0;
  const color   = levelColor(pct);

  const TANK_H = 100;

  return (
    <div
      style={{
        width, height,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: `1px solid ${primary}44`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 12px 8px",
        boxSizing: "border-box",
        gap: 6,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Icono pequeño arriba */}
      <div style={{ color: primary, opacity: 0.8 }}>
        <Icon style={{ width: 24, height: 24 }} strokeWidth={1.5} />
      </div>

      {/* Cuerpo del tanque */}
      <div style={{
        width: 72,
        height: TANK_H,
        border: "1.5px solid #334155",
        borderRadius: 4,
        background: "#0f172a",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Líneas de escala */}
        {[0.25, 0.5, 0.75].map((f) => (
          <div key={f} style={{
            position: "absolute",
            bottom: `${f * 100}%`,
            left: 0, right: 0,
            height: 1,
            background: "#334155",
          }} />
        ))}

        {/* Relleno de nivel */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${pct * 100}%`,
          background: `linear-gradient(to top, ${color}99, ${color}66)`,
          transition: "height 0.5s ease",
        }} />

        {/* Valor centrado */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 1,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{display}</span>
          <span style={{ fontSize: 9, color: "#64748b" }}>{unit}</span>
        </div>
      </div>

      {/* Barra lineal */}
      <div style={{ width: "100%" }}>
        <div style={{
          height: 4, borderRadius: 2, background: "#1e293b",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${pct * 100}%`,
            background: color, opacity: 0.85,
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 8, color: "#475569", marginTop: 2,
        }}>
          <span>{min}</span><span>{max}</span>
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontSize: 9, fontWeight: 600, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.05em",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {label}
      </div>
    </div>
  );
}
