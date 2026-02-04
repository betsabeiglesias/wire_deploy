import React from "react";

export default function EnergyBarChart({
  title = "CONSUMO ENERGÉTICO (kW)",
  valueText = "420 kW",
}) {
  return (
    <svg
      width="220"
      height="250"
      viewBox="0 0 400 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00d2d3", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#0984e3", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="250" fill="#1e272e" rx="10" />

      <text
        x="20"
        y="30"
        fontFamily="Arial"
        fontSize="14"
        fontWeight="bold"
        fill="#ecf0f1"
      >
        {title}
      </text>

      <g fontFamily="Arial" fontSize="10" fill="#95a5a6" textAnchor="end">
        <text x="40" y="60">
          1500
        </text>
        <text x="40" y="100">
          1000
        </text>
        <text x="40" y="140">
          500
        </text>
        <text x="40" y="180">
          0
        </text>
      </g>

      <line x1="50" y1="60" x2="370" y2="60" stroke="#2f3640" strokeWidth="1" />
      <line
        x1="50"
        y1="100"
        x2="370"
        y2="100"
        stroke="#2f3640"
        strokeWidth="1"
      />
      <line
        x1="50"
        y1="140"
        x2="370"
        y2="140"
        stroke="#2f3640"
        strokeWidth="1"
      />
      <line
        x1="50"
        y1="180"
        x2="370"
        y2="180"
        stroke="#57606f"
        strokeWidth="2"
      />

      <rect
        x="65"
        y="90"
        width="35"
        height="90"
        fill="url(#barGradient)"
        rx="2"
      >
        <animate
          attributeName="height"
          from="0"
          to="90"
          dur="1s"
          fill="freeze"
        />
        <animate attributeName="y" from="180" to="90" dur="1s" fill="freeze" />
      </rect>
      <rect
        x="115"
        y="70"
        width="35"
        height="110"
        fill="url(#barGradient)"
        rx="2"
      >
        <animate
          attributeName="height"
          from="0"
          to="110"
          dur="1.2s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="180"
          to="70"
          dur="1.2s"
          fill="freeze"
        />
      </rect>
      <rect
        x="165"
        y="110"
        width="35"
        height="70"
        fill="url(#barGradient)"
        rx="2"
      >
        <animate
          attributeName="height"
          from="0"
          to="70"
          dur="0.8s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="180"
          to="110"
          dur="0.8s"
          fill="freeze"
        />
      </rect>
      <rect x="215" y="50" width="35" height="130" fill="#ff7675" rx="2">
        <animate
          attributeName="opacity"
          values="1;0.7;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="265"
        y="85"
        width="35"
        height="95"
        fill="url(#barGradient)"
        rx="2"
      />
      <rect
        x="315"
        y="100"
        width="35"
        height="80"
        fill="url(#barGradient)"
        rx="2"
      />

      <g fontFamily="Arial" fontSize="10" fill="#95a5a6" textAnchor="middle">
        <text x="82.5" y="200">
          08:00
        </text>
        <text x="132.5" y="200">
          10:00
        </text>
        <text x="182.5" y="200">
          12:00
        </text>
        <text x="232.5" y="200">
          14:00
        </text>
        <text x="282.5" y="200">
          16:00
        </text>
        <text x="332.5" y="200">
          18:00
        </text>
      </g>

      <line
        x1="50"
        y1="80"
        x2="370"
        y2="80"
        stroke="#d63031"
        strokeWidth="2"
        strokeDasharray="5,3"
      />
      <text
        x="370"
        y="75"
        fontFamily="Arial"
        fontSize="9"
        fill="#d63031"
        textAnchor="end"
        fontWeight="bold"
      >
        LÍMITE: 1250 kW
      </text>

      <text
        x="380"
        y="30"
        fontFamily="Arial"
        fontSize="20"
        fontWeight="bold"
        fill="#00d2d3"
        textAnchor="end"
      >
        {valueText}
      </text>
    </svg>
  );
}
