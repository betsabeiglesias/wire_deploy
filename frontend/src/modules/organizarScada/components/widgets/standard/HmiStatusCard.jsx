import React, { useId } from "react";

const STATUS_MAP = {
  ok: {
    stroke: "#2ecc71",
    text: "#2ecc71",
    gradStart: "#2ecc71",
    gradEnd: "#27ae60",
    gradStartOpacity: 0.2,
    gradEndOpacity: 0.1,
    border: "#3f4551",
  },
  warning: {
    stroke: "#f1c40f",
    text: "#f1c40f",
    gradStart: "#f1c40f",
    gradEnd: "#f39c12",
    gradStartOpacity: 0.3,
    gradEndOpacity: 0.1,
    border: "#3f4551",
  },
  emergency: {
    stroke: "#ff4d4d",
    text: "#ff4d4d",
    gradStart: "#e74c3c",
    gradEnd: "#c0392b",
    gradStartOpacity: 0.4,
    gradEndOpacity: 0.2,
    border: "#ff4d4d",
  },
};

const HmiStatusCard = ({
  status = "ok",
  title = "SISTEMA OK",
  subtitle = "STATUS: READY",
  width = 280,
  height = 90,
}) => {
  const uid = useId().replace(/:/g, "");
  const safeStatus = STATUS_MAP[status] ? status : "ok";
  const cfg = STATUS_MAP[safeStatus];
  const gradId = `status-grad-${safeStatus}-${uid}`;

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
          <stop offset="0%" stopColor={cfg.gradStart} stopOpacity={cfg.gradStartOpacity} />
          <stop offset="100%" stopColor={cfg.gradEnd} stopOpacity={cfg.gradEndOpacity} />
        </linearGradient>
      </defs>
      <style>{`
        @keyframes pulse-red {
          0% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.5) drop-shadow(0 0 10px #ff4d4d); }
          100% { opacity: 1; filter: brightness(1); }
        }
        .emergency-${uid} {
          animation: pulse-red 1.5s infinite ease-in-out;
        }
      `}</style>

      <g className={safeStatus === "emergency" ? `emergency-${uid}` : undefined}>
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
          stroke={cfg.stroke}
          strokeWidth={safeStatus === "emergency" ? "2" : "1.5"}
          strokeOpacity={safeStatus === "warning" ? "0.8" : "0.6"}
        />
        <text
          x="140"
          y="52"
          fill={cfg.text}
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
          fill={cfg.text === "#ff4d4d" ? "#ff4d4d" : "#94a3b8"}
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
