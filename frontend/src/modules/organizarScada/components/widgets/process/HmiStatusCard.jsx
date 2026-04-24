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

  backgroundColor = "#2c313c",
  textColor = "#ffffff",
  primaryColor,
  secondaryColor,

  accentColor,
}) => {
  const uid = useId().replace(/:/g, "");
  const safeStatus = STATUS_MAP[status] ? status : "ok";
  const cfg = STATUS_MAP[safeStatus];

  const color = accentColor || primaryColor || cfg.stroke;
  const gradStart = accentColor || primaryColor || cfg.gradStart;
  const gradEnd = accentColor || primaryColor || cfg.gradEnd;
  const borderColor = secondaryColor || cfg.border;

  const gradId = `status-grad-${uid}`;

  return (
    <svg width={width} height={height} viewBox="0 0 280 90">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradStart} stopOpacity={cfg.gradStartOpacity} />
          <stop offset="100%" stopColor={gradEnd} stopOpacity={cfg.gradEndOpacity} />
        </linearGradient>
      </defs>

      <rect
        width="280"
        height="90"
        rx="10"
        fill={backgroundColor}
        stroke={borderColor}
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
      />

      <text
        x="140"
        y="52"
        fill={color}
        fontSize="22"
        fontWeight="bold"
        textAnchor="middle"
      >
        {title}
      </text>

      <text x="20" y="12" fill={textColor} fontSize="10">
        {subtitle}
      </text>
    </svg>
  );
};

export default HmiStatusCard;