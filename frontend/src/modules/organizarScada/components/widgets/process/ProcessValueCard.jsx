import { ICON_MAP } from "../iconMap";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function ProcessValueCard({
  iconKey = "pump",
  label = "",
  value = null,
  unit = "",
  min = 0,
  max = 100,

  primaryColor,
  backgroundColor,
  textColor,

  width = 200,
  height = 120,
}) {
  const Icon = ICON_MAP[iconKey] || ICON_MAP.gauge;

  const numVal =
    value !== null && value !== undefined ? Number(value) : null;

  const display =
    numVal !== null && !Number.isNaN(numVal)
      ? numVal.toFixed(1)
      : "—";

  const pct =
    numVal !== null
      ? clamp((numVal - min) / (max - min || 1), 0, 1)
      : 0;

  return (
    <div
      style={{
        width,
        height,
        background: backgroundColor,
        border: `1px solid ${primaryColor}55`,
        borderRadius: 10,
        padding: 12,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 14,
          bottom: 14,
          width: 3,
          background: primaryColor,
        }}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ color: primaryColor }}>
          <Icon style={{ width: 36, height: 36 }} />
        </div>

        <div>
          <div style={{ fontSize: 9, color: "#94a3b8" }}>{label}</div>
          <div style={{ fontSize: 26, color: textColor }}>{display}</div>
          {unit && <div style={{ fontSize: 10 }}>{unit}</div>}
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        <div style={{ height: 4, background: "#1e293b" }}>
          <div
            style={{
              width: `${pct * 100}%`,
              height: "100%",
              background: primaryColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}