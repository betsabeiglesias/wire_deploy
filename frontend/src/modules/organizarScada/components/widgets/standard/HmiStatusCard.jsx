import React, { useId } from "react";

const STATUS_MAP = {
  ok: {
    stroke: "#2ecc71",
    text: "#2ecc71",
    gradStart: "#2ecc71",
    gradEnd: "#27ae60",
    gradStartOpacity: 0.18,
    gradEndOpacity: 0.08,
    border: "#3f4551",
    className: "ok",
  },
  warning: {
    stroke: "#f1c40f",
    text: "#f1c40f",
    gradStart: "#f1c40f",
    gradEnd: "#f39c12",
    gradStartOpacity: 0.25,
    gradEndOpacity: 0.1,
    border: "#3f4551",
    className: "warning",
  },
  emergency: {
    stroke: "#ff4d4d",
    text: "#ff4d4d",
    gradStart: "#e74c3c",
    gradEnd: "#c0392b",
    gradStartOpacity: 0.4,
    gradEndOpacity: 0.2,
    border: "#ff4d4d",
    className: "emergency",
  },
};

const HmiStatusCard = ({
  status = "ok",
  title = "SISTEMA OK",
  subtitle = "STATUS: READY",
  width = 280,
  height = 90,
  accentColor, // 👈 añadido
}) => {
  const uid = useId().replace(/:/g, "");
  const safeStatus = STATUS_MAP[status] ? status : "ok";
  const cfg = STATUS_MAP[safeStatus];
  const gradId = `status-grad-${safeStatus}-${uid}`;

  const color = accentColor || cfg.stroke;
  const gradStart = accentColor || cfg.gradStart;
  const gradEnd = accentColor || cfg.gradEnd;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradStart} stopOpacity={cfg.gradStartOpacity} />
          <stop offset="100%" stopColor={gradEnd} stopOpacity={cfg.gradEndOpacity} />
        </linearGradient>
      </defs>
      <style>{`
        @keyframes pulse-red {
          0% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.85; filter: brightness(1.4) drop-shadow(0 0 10px #ff4d4d); }
          100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes pulse-amber {
          0% { opacity: 1; }
          50% { opacity: 0.85; filter: drop-shadow(0 0 8px rgba(241,196,15,0.6)); }
          100% { opacity: 1; }
        }
        @keyframes glow-green {
          0% { filter: drop-shadow(0 0 0px rgba(46,204,113,0.0)); }
          50% { filter: drop-shadow(0 0 8px rgba(46,204,113,0.35)); }
          100% { filter: drop-shadow(0 0 0px rgba(46,204,113,0.0)); }
        }
        .emergency-${uid} { animation: pulse-red 1.4s infinite ease-in-out; }
        .warning-${uid} { animation: pulse-amber 1.6s infinite ease-in-out; }
        .ok-${uid} { animation: glow-green 2.2s infinite ease-in-out; }
      `}</style>

      <g className={`${cfg.className}-${uid}`}>
        <rect
          width="280"
          height="90"
          rx="10"
          fill="#2c313c"
          stroke={cfg.border}
          strokeWidth="2"
        />
        <rect
          x="15"
          y="15"
          width="250"
          height="60"
          rx="5"
          fill={`url(#${gradId})`}
          stroke={color}
          strokeWidth={safeStatus === "emergency" ? "2" : "1.5"}
          strokeOpacity={safeStatus === "warning" ? "0.8" : "0.6"}
        />
        <text
          x="140"
          y="52"
          fill={color}
          fontSize="22"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
          fontFamily="'Segoe UI', Arial, sans-serif"
        >
          {title}
        </text>
        <text
          x="20"
          y="12"
          fill={color === "#ff4d4d" ? "#ff4d4d" : "#94a3b8"}
          fontSize="10"
          fontWeight="bold"
          fontFamily="'Segoe UI', Arial, sans-serif"
        >
          {subtitle}
        </text>
      </g>
    </svg>
  );
};

export default HmiStatusCard;